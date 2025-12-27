"""
Configuration des URLs pour l'application properties.
Définit tous les endpoints de gestion des biens immobiliers.
"""

from django.urls import path
from .views import (
    PropertyListView,
    PropertyCreateView,
    PropertyDetailView,
    PropertyStatsView,
)

app_name = 'properties'

urlpatterns = [
    # ==========================================================================
    # LISTE ET CRÉATION
    # ==========================================================================
    
    # GET /api/properties/
    # Liste des biens (filtrée selon le rôle)
    path('', PropertyListView.as_view(), name='property_list'),
    
    # POST /api/properties/create/
    # Créer un nouveau bien
    path('create/', PropertyCreateView.as_view(), name='property_create'),
    
    # ==========================================================================
    # DÉTAILS ET MODIFICATION
    # ==========================================================================
    
    # GET, PATCH, DELETE /api/properties/<id>/
    # Consulter, modifier ou supprimer un bien
    path('<int:pk>/', PropertyDetailView.as_view(), name='property_detail'),
    
    # ==========================================================================
    # STATISTIQUES
    # ==========================================================================
    
    # GET /api/properties/stats/
    # Statistiques des biens
    path('stats/', PropertyStatsView.as_view(), name='property_stats'),
]
