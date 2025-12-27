"""
Vues API pour la gestion des locataires et assignations.
Fournit les endpoints pour gérer les relations locataire-bien.
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import TenantAssignment
from .serializers import (
    TenantAssignmentSerializer,
    TenantAssignmentCreateSerializer,
    TenantListSerializer,
    TenantPropertyViewSerializer,
)
from apps.accounts.permissions import IsAdminOrAgent, IsTenant

User = get_user_model()


class TenantListView(generics.ListAPIView):
    """
    Endpoint pour lister les locataires.
    
    GET /api/tenants/
    
    - Admin : Voit tous les locataires
    - Agent : Voit les locataires de ses biens
    
    Query params:
        - search: Rechercher par nom ou email
        - has_property: Filtrer par locataires avec/sans logement
    """
    
    serializer_class = TenantListSerializer
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les locataires selon le rôle."""
        user = self.request.user
        
        # Base : uniquement les locataires
        queryset = User.objects.filter(role='tenant')
        
        # Agent : uniquement les locataires de ses biens
        if user.role == 'agent':
            tenant_ids = TenantAssignment.objects.filter(
                property__agent=user
            ).values_list('tenant_id', flat=True)
            queryset = queryset.filter(id__in=tenant_ids)
        
        # Filtres
        params = self.request.query_params
        
        # Recherche
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Filtre locataires avec/sans logement
        has_property = params.get('has_property')
        if has_property is not None:
            active_tenant_ids = TenantAssignment.objects.filter(
                is_active=True
            ).values_list('tenant_id', flat=True)
            
            if has_property.lower() == 'true':
                queryset = queryset.filter(id__in=active_tenant_ids)
            else:
                queryset = queryset.exclude(id__in=active_tenant_ids)
        
        return queryset.prefetch_related('tenant_assignments__property')


class TenantDetailView(generics.RetrieveAPIView):
    """
    Endpoint pour consulter les détails d'un locataire.
    
    GET /api/tenants/<id>/
    """
    
    serializer_class = TenantListSerializer
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les locataires accessibles."""
        user = self.request.user
        
        queryset = User.objects.filter(role='tenant')
        
        if user.role == 'agent':
            tenant_ids = TenantAssignment.objects.filter(
                property__agent=user
            ).values_list('tenant_id', flat=True)
            queryset = queryset.filter(id__in=tenant_ids)
        
        return queryset


class AssignmentListView(generics.ListAPIView):
    """
    Endpoint pour lister les assignations locataire-bien.
    
    GET /api/tenants/assignments/
    
    Query params:
        - is_active: Filtrer par bail actif/inactif
        - property_id: Filtrer par bien
        - tenant_id: Filtrer par locataire
    """
    
    serializer_class = TenantAssignmentSerializer
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les assignations selon le rôle."""
        user = self.request.user
        
        if user.role == 'admin':
            queryset = TenantAssignment.objects.all()
        else:
            queryset = TenantAssignment.objects.filter(property__agent=user)
        
        # Filtres
        params = self.request.query_params
        
        is_active = params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        property_id = params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        
        tenant_id = params.get('tenant_id')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        
        return queryset.select_related('tenant', 'property', 'agent')


class AssignmentCreateView(generics.CreateAPIView):
    """
    Endpoint pour créer une assignation locataire-bien.
    
    POST /api/tenants/assignments/create/
    
    Request body:
        {
            "tenant": 5,
            "property": 3,
            "start_date": "2024-01-01",
            "end_date": "2025-01-01",
            "rent_amount": 1200.00,
            "deposit": 2400.00,
            "notes": "Bail de 1 an renouvelable"
        }
    """
    
    serializer_class = TenantAssignmentCreateSerializer
    permission_classes = [IsAdminOrAgent]
    
    def perform_create(self, serializer):
        """Assigne l'agent créateur."""
        serializer.save(agent=self.request.user)


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint pour gérer une assignation spécifique.
    
    GET /api/tenants/assignments/<id>/
    PATCH /api/tenants/assignments/<id>/
    DELETE /api/tenants/assignments/<id>/
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les assignations accessibles."""
        user = self.request.user
        
        if user.role == 'admin':
            return TenantAssignment.objects.all()
        return TenantAssignment.objects.filter(property__agent=user)
    
    def get_serializer_class(self):
        """Retourne le sérialiseur approprié."""
        if self.request.method in ['PUT', 'PATCH']:
            return TenantAssignmentCreateSerializer
        return TenantAssignmentSerializer


class EndAssignmentView(APIView):
    """
    Endpoint pour terminer un bail.
    
    POST /api/tenants/assignments/<id>/end/
    
    Désactive l'assignation sans la supprimer (conservation de l'historique).
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def post(self, request, pk):
        """Termine le bail."""
        try:
            if request.user.role == 'admin':
                assignment = TenantAssignment.objects.get(pk=pk)
            else:
                assignment = TenantAssignment.objects.get(
                    pk=pk,
                    property__agent=request.user
                )
        except TenantAssignment.DoesNotExist:
            return Response(
                {'error': 'Assignation non trouvée'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        assignment.is_active = False
        assignment.save()
        
        return Response({
            'message': 'Bail terminé avec succès',
            'assignment': TenantAssignmentSerializer(assignment).data
        })


class MyPropertyView(generics.RetrieveAPIView):
    """
    Endpoint pour locataire - consulter son logement.
    
    GET /api/tenants/my-property/
    
    Retourne les détails du bien actuellement loué par le locataire connecté.
    """
    
    serializer_class = TenantPropertyViewSerializer
    permission_classes = [IsTenant]
    
    def get_object(self):
        """Retourne l'assignation active du locataire."""
        try:
            return TenantAssignment.objects.select_related(
                'property',
                'property__agent'
            ).get(
                tenant=self.request.user,
                is_active=True
            )
        except TenantAssignment.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        """Gère le cas où le locataire n'a pas de logement."""
        instance = self.get_object()
        if instance is None:
            return Response(
                {'message': 'Vous n\'avez pas de logement attribué actuellement.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
