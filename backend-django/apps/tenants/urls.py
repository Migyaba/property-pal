"""
Configuration des URLs pour l'application tenants.
Définit les endpoints de gestion des locataires et assignations.
"""

from django.urls import path
from .views import (
    TenantListView,
    TenantDetailView,
    AssignmentListView,
    AssignmentCreateView,
    AssignmentDetailView,
    EndAssignmentView,
    MyPropertyView,
)

app_name = 'tenants'

urlpatterns = [
    # ==========================================================================
    # GESTION DES LOCATAIRES (AGENT/ADMIN)
    # ==========================================================================
    
    # GET /api/tenants/
    # Liste des locataires
    path('', TenantListView.as_view(), name='tenant_list'),
    
    # GET /api/tenants/<id>/
    # Détails d'un locataire
    path('<int:pk>/', TenantDetailView.as_view(), name='tenant_detail'),
    
    # ==========================================================================
    # GESTION DES ASSIGNATIONS (AGENT/ADMIN)
    # ==========================================================================
    
    # GET /api/tenants/assignments/
    # Liste des assignations
    path('assignments/', AssignmentListView.as_view(), name='assignment_list'),
    
    # POST /api/tenants/assignments/create/
    # Créer une assignation
    path('assignments/create/', AssignmentCreateView.as_view(), name='assignment_create'),
    
    # GET, PATCH, DELETE /api/tenants/assignments/<id>/
    # Gérer une assignation
    path('assignments/<int:pk>/', AssignmentDetailView.as_view(), name='assignment_detail'),
    
    # POST /api/tenants/assignments/<id>/end/
    # Terminer un bail
    path('assignments/<int:pk>/end/', EndAssignmentView.as_view(), name='assignment_end'),
    
    # ==========================================================================
    # INTERFACE LOCATAIRE
    # ==========================================================================
    
    # GET /api/tenants/my-property/
    # Consulter son logement (locataire connecté)
    path('my-property/', MyPropertyView.as_view(), name='my_property'),
]
