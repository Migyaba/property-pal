"""
Vues API pour la gestion des paiements.
Fournit les endpoints pour gérer les échéances et paiements de loyer.
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import date, timedelta

from .models import Payment
from .serializers import (
    PaymentSerializer,
    PaymentCreateSerializer,
    PaymentUpdateSerializer,
    PaymentListSerializer,
    TenantPaymentSerializer,
    PaymentStatsSerializer,
)
from apps.accounts.permissions import IsAdminOrAgent, IsTenant
from apps.tenants.models import TenantAssignment


class PaymentListView(generics.ListAPIView):
    """
    Endpoint pour lister les paiements.
    
    GET /api/payments/
    
    Query params:
        - status: Filtrer par statut (paid, pending, overdue)
        - month: Filtrer par mois (format: YYYY-MM)
        - property_id: Filtrer par bien
        - tenant_id: Filtrer par locataire
    """
    
    serializer_class = PaymentListSerializer
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les paiements selon le rôle."""
        user = self.request.user
        
        if user.role == 'admin':
            queryset = Payment.objects.all()
        else:
            # Agent : paiements de ses biens
            queryset = Payment.objects.filter(
                assignment__property__agent=user
            )
        
        # Filtres
        params = self.request.query_params
        
        # Statut
        status_filter = params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Mois
        month = params.get('month')
        if month:
            try:
                year, month_num = month.split('-')
                queryset = queryset.filter(
                    due_date__year=int(year),
                    due_date__month=int(month_num)
                )
            except ValueError:
                pass
        
        # Bien
        property_id = params.get('property_id')
        if property_id:
            queryset = queryset.filter(assignment__property_id=property_id)
        
        # Locataire
        tenant_id = params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(assignment__tenant_id=tenant_id)
        
        return queryset.select_related(
            'assignment__tenant',
            'assignment__property'
        )


class PaymentCreateView(generics.CreateAPIView):
    """
    Endpoint pour créer une échéance de paiement.
    
    POST /api/payments/create/
    
    Request body:
        {
            "assignment": 5,
            "amount": 1200.00,
            "due_date": "2024-02-01",
            "notes": "Loyer février 2024"
        }
    """
    
    serializer_class = PaymentCreateSerializer
    permission_classes = [IsAdminOrAgent]


class PaymentDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint pour consulter et modifier un paiement.
    
    GET /api/payments/<id>/
    PATCH /api/payments/<id>/
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Payment.objects.all()
        return Payment.objects.filter(assignment__property__agent=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PaymentUpdateSerializer
        return PaymentSerializer


class RecordPaymentView(APIView):
    """
    Endpoint pour enregistrer un paiement effectué.
    
    POST /api/payments/<id>/record/
    
    Request body:
        {
            "payment_date": "2024-02-05",
            "payment_method": "bank_transfer",
            "notes": "Paiement reçu par virement"
        }
    
    Marque automatiquement le paiement comme "payé" et génère le reçu.
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def post(self, request, pk):
        """Enregistre le paiement."""
        try:
            if request.user.role == 'admin':
                payment = Payment.objects.get(pk=pk)
            else:
                payment = Payment.objects.get(
                    pk=pk,
                    assignment__property__agent=request.user
                )
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Paiement non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Mettre à jour le paiement
        payment.status = Payment.Status.PAID
        payment.payment_date = request.data.get('payment_date', date.today())
        payment.payment_method = request.data.get('payment_method', 'other')
        payment.notes = request.data.get('notes', '')
        payment.save()
        
        return Response({
            'message': 'Paiement enregistré avec succès',
            'payment': PaymentSerializer(payment).data
        })


class GenerateMonthlyPaymentsView(APIView):
    """
    Endpoint pour générer les échéances mensuelles.
    
    POST /api/payments/generate-monthly/
    
    Génère automatiquement les paiements pour tous les baux actifs
    pour le mois suivant.
    
    Request body (optionnel):
        {
            "month": "2024-03",  // Mois cible (défaut: mois suivant)
            "day": 5             // Jour d'échéance (défaut: 5)
        }
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def post(self, request):
        """Génère les paiements mensuels."""
        user = request.user
        
        # Récupérer les paramètres
        today = date.today()
        default_month = today.replace(day=1) + timedelta(days=32)
        default_month = default_month.replace(day=1)
        
        month_str = request.data.get('month')
        if month_str:
            try:
                year, month = month_str.split('-')
                target_date = date(int(year), int(month), 1)
            except ValueError:
                target_date = default_month
        else:
            target_date = default_month
        
        day = int(request.data.get('day', 5))
        due_date = target_date.replace(day=min(day, 28))  # Éviter les problèmes de février
        
        # Récupérer les assignations actives
        if user.role == 'admin':
            assignments = TenantAssignment.objects.filter(is_active=True)
        else:
            assignments = TenantAssignment.objects.filter(
                is_active=True,
                property__agent=user
            )
        
        created_count = 0
        skipped_count = 0
        
        for assignment in assignments:
            # Vérifier si le paiement existe déjà pour ce mois
            existing = Payment.objects.filter(
                assignment=assignment,
                due_date__year=due_date.year,
                due_date__month=due_date.month
            ).exists()
            
            if existing:
                skipped_count += 1
                continue
            
            # Créer le paiement
            Payment.objects.create(
                assignment=assignment,
                amount=assignment.rent_amount + assignment.property.charges,
                due_date=due_date,
                notes=f"Loyer {due_date.strftime('%B %Y')}"
            )
            created_count += 1
        
        return Response({
            'message': f'Génération terminée',
            'created': created_count,
            'skipped': skipped_count,
            'due_date': due_date.isoformat()
        })


class PaymentStatsView(APIView):
    """
    Endpoint pour les statistiques de paiement.
    
    GET /api/payments/stats/
    
    Query params:
        - month: Mois cible (format: YYYY-MM, défaut: mois en cours)
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def get(self, request):
        """Calcule les statistiques de paiement."""
        user = request.user
        today = date.today()
        
        # Filtrer par mois
        month_str = request.query_params.get('month')
        if month_str:
            try:
                year, month = month_str.split('-')
                target_year = int(year)
                target_month = int(month)
            except ValueError:
                target_year = today.year
                target_month = today.month
        else:
            target_year = today.year
            target_month = today.month
        
        # Base queryset
        if user.role == 'admin':
            queryset = Payment.objects.all()
        else:
            queryset = Payment.objects.filter(
                assignment__property__agent=user
            )
        
        # Filtrer par mois
        queryset = queryset.filter(
            due_date__year=target_year,
            due_date__month=target_month
        )
        
        # Calculer les statistiques
        stats = queryset.aggregate(
            total_payments=Count('id'),
            paid_count=Count('id', filter=Q(status='paid')),
            pending_count=Count('id', filter=Q(status='pending')),
            overdue_count=Count('id', filter=Q(status='overdue')),
            total_collected=Sum('amount', filter=Q(status='paid')),
            total_pending=Sum('amount', filter=~Q(status='paid'))
        )
        
        # Calculer le taux de recouvrement
        total = stats['total_payments'] or 0
        paid = stats['paid_count'] or 0
        collection_rate = (paid / total * 100) if total > 0 else 0
        
        stats['collection_rate'] = round(collection_rate, 2)
        stats['total_collected'] = float(stats['total_collected'] or 0)
        stats['total_pending'] = float(stats['total_pending'] or 0)
        
        return Response(stats)


# =============================================================================
# ENDPOINTS LOCATAIRE
# =============================================================================

class MyPaymentsView(generics.ListAPIView):
    """
    Endpoint locataire - liste de ses paiements.
    
    GET /api/payments/my-payments/
    
    Retourne l'historique des paiements du locataire connecté.
    """
    
    serializer_class = TenantPaymentSerializer
    permission_classes = [IsTenant]
    
    def get_queryset(self):
        """Retourne les paiements du locataire connecté."""
        return Payment.objects.filter(
            assignment__tenant=self.request.user
        ).select_related(
            'assignment__property'
        ).order_by('-due_date')


class MyCurrentPaymentView(APIView):
    """
    Endpoint locataire - paiement en cours.
    
    GET /api/payments/my-current/
    
    Retourne le paiement le plus récent en attente ou en retard.
    """
    
    permission_classes = [IsTenant]
    
    def get(self, request):
        """Retourne le paiement courant."""
        payment = Payment.objects.filter(
            assignment__tenant=request.user,
            status__in=['pending', 'overdue']
        ).select_related(
            'assignment__property'
        ).order_by('due_date').first()
        
        if payment:
            return Response(TenantPaymentSerializer(payment).data)
        
        return Response({
            'message': 'Aucun paiement en attente'
        })


class MakePaymentView(APIView):
    """
    Endpoint locataire - effectuer un paiement.
    
    POST /api/payments/<id>/pay/
    
    Permet au locataire de déclarer un paiement.
    (En production, intégrer ici la logique de paiement réel)
    
    Request body:
        {
            "payment_method": "card"
        }
    """
    
    permission_classes = [IsTenant]
    
    def post(self, request, pk):
        """Enregistre le paiement par le locataire."""
        try:
            payment = Payment.objects.get(
                pk=pk,
                assignment__tenant=request.user
            )
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Paiement non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if payment.status == Payment.Status.PAID:
            return Response(
                {'error': 'Ce paiement a déjà été effectué'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # En production, ici vous intégreriez Stripe ou autre
        # Pour le MVP, on marque simplement le paiement comme effectué
        
        payment.status = Payment.Status.PAID
        payment.payment_date = date.today()
        payment.payment_method = request.data.get('payment_method', 'card')
        payment.save()
        
        return Response({
            'message': 'Paiement effectué avec succès',
            'receipt_number': payment.receipt_number,
            'payment': TenantPaymentSerializer(payment).data
        })
