"""
Configuration des URLs pour l'application accounts.
Définit tous les endpoints liés à l'authentification et la gestion des utilisateurs.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    UserProfileView,
    ChangePasswordView,
    UserListView,
    AgentListView,
    AgentCreateView,
    TenantCreateView,
    UserDetailView,
    DashboardStatsView,
)

app_name = 'accounts'

urlpatterns = [
    # ==========================================================================
    # AUTHENTIFICATION
    # ==========================================================================
    
    # POST /api/accounts/login/
    # Connexion et obtention des tokens JWT
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    
    # POST /api/accounts/refresh/
    # Rafraîchissement du token d'accès
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ==========================================================================
    # PROFIL UTILISATEUR
    # ==========================================================================
    
    # GET, PATCH /api/accounts/profile/
    # Consulter et modifier son profil
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # POST /api/accounts/change-password/
    # Changer son mot de passe
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # ==========================================================================
    # GESTION DES UTILISATEURS (ADMIN)
    # ==========================================================================
    
    # GET /api/accounts/users/
    # Liste tous les utilisateurs
    path('users/', UserListView.as_view(), name='user_list'),
    
    # GET, PATCH, DELETE /api/accounts/users/<id>/
    # Gérer un utilisateur spécifique
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    
    # GET /api/accounts/agents/
    # Liste des agents immobiliers
    path('agents/', AgentListView.as_view(), name='agent_list'),
    
    # POST /api/accounts/agents/create/
    # Créer un agent immobilier
    path('agents/create/', AgentCreateView.as_view(), name='agent_create'),
    
    # ==========================================================================
    # GESTION DES LOCATAIRES (AGENT)
    # ==========================================================================
    
    # POST /api/accounts/tenants/create/
    # Créer un compte locataire
    path('tenants/create/', TenantCreateView.as_view(), name='tenant_create'),
    
    # ==========================================================================
    # STATISTIQUES
    # ==========================================================================
    
    # GET /api/accounts/stats/
    # Statistiques du dashboard selon le rôle
    path('stats/', DashboardStatsView.as_view(), name='stats'),
]
