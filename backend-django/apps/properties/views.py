"""
Vues API pour la gestion des biens immobiliers.
Fournit les endpoints CRUD pour les propriétés.
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, Q

from .models import Property
from .serializers import (
    PropertySerializer,
    PropertyCreateSerializer,
    PropertyListSerializer,
    PropertyStatsSerializer,
)
from apps.accounts.permissions import IsAdminOrAgent, IsAgent


class PropertyListView(generics.ListAPIView):
    """
    Endpoint pour lister les biens immobiliers.
    
    GET /api/properties/
    
    - Admin : Voit tous les biens
    - Agent : Voit uniquement ses biens
    - Tenant : Non autorisé (utilise un endpoint spécifique)
    
    Query params:
        - city: Filtrer par ville
        - property_type: Filtrer par type (apartment, house, etc.)
        - is_available: Filtrer par disponibilité (true/false)
        - search: Rechercher par nom ou adresse
        - min_rent / max_rent: Filtrer par fourchette de loyer
    """
    
    serializer_class = PropertyListSerializer
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les biens selon le rôle de l'utilisateur."""
        user = self.request.user
        
        # Admin voit tout, agent voit seulement ses biens
        if user.role == 'admin':
            queryset = Property.objects.all()
        else:
            queryset = Property.objects.filter(agent=user)
        
        # Application des filtres
        params = self.request.query_params
        
        # Filtre par ville
        city = params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filtre par type de bien
        property_type = params.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        
        # Filtre par disponibilité
        is_available = params.get('is_available')
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == 'true')
        
        # Recherche textuelle
        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(address__icontains=search) |
                Q(city__icontains=search)
            )
        
        # Filtre par fourchette de loyer
        min_rent = params.get('min_rent')
        if min_rent:
            queryset = queryset.filter(monthly_rent__gte=min_rent)
        
        max_rent = params.get('max_rent')
        if max_rent:
            queryset = queryset.filter(monthly_rent__lte=max_rent)
        
        return queryset.select_related('agent')


class PropertyCreateView(generics.CreateAPIView):
    """
    Endpoint pour créer un nouveau bien.
    
    POST /api/properties/create/
    
    L'agent est automatiquement assigné à l'utilisateur connecté.
    
    Request body:
        {
            "name": "Appartement Haussmann",
            "address": "15 rue de la Paix",
            "city": "Paris",
            "postal_code": "75002",
            "property_type": "apartment",
            "surface": 85.5,
            "rooms": 4,
            "monthly_rent": 1500,
            "charges": 150,
            "description": "Bel appartement lumineux..."
        }
    """
    
    serializer_class = PropertyCreateSerializer
    permission_classes = [IsAdminOrAgent]
    
    def perform_create(self, serializer):
        """Assigne automatiquement l'agent connecté au bien."""
        serializer.save(agent=self.request.user)


class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint pour consulter, modifier ou supprimer un bien.
    
    GET /api/properties/<id>/
        Consulter les détails d'un bien
    
    PATCH /api/properties/<id>/
        Modifier un bien
    
    DELETE /api/properties/<id>/
        Supprimer un bien
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def get_queryset(self):
        """Retourne les biens accessibles selon le rôle."""
        user = self.request.user
        
        if user.role == 'admin':
            return Property.objects.all()
        return Property.objects.filter(agent=user)
    
    def get_serializer_class(self):
        """Utilise le sérialiseur approprié selon la méthode."""
        if self.request.method in ['PUT', 'PATCH']:
            return PropertyCreateSerializer
        return PropertySerializer


class PropertyStatsView(APIView):
    """
    Endpoint pour les statistiques des biens.
    
    GET /api/properties/stats/
    
    Response:
        {
            "total_properties": 25,
            "available_properties": 5,
            "rented_properties": 20,
            "total_monthly_revenue": 35000.00,
            "occupancy_rate": 0.80
        }
    """
    
    permission_classes = [IsAdminOrAgent]
    
    def get(self, request):
        """Calcule et retourne les statistiques des biens."""
        user = request.user
        
        # Filtrer les biens selon le rôle
        if user.role == 'admin':
            properties = Property.objects.all()
        else:
            properties = Property.objects.filter(agent=user)
        
        # Calcul des statistiques
        total = properties.count()
        available = properties.filter(is_available=True).count()
        rented = total - available
        
        # Revenu mensuel total (loyers des biens occupés)
        total_revenue = properties.filter(
            is_available=False
        ).aggregate(
            total=Sum('monthly_rent')
        )['total'] or 0
        
        # Taux d'occupation
        occupancy_rate = (rented / total * 100) if total > 0 else 0
        
        stats = {
            'total_properties': total,
            'available_properties': available,
            'rented_properties': rented,
            'total_monthly_revenue': float(total_revenue),
            'occupancy_rate': round(occupancy_rate, 2)
        }
        
        return Response(stats)
