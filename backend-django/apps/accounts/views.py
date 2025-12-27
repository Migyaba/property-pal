"""
Vues API pour la gestion des comptes utilisateurs.
Fournit les endpoints d'authentification et de gestion des utilisateurs.
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserUpdateSerializer,
    ChangePasswordSerializer,
    CustomTokenObtainPairSerializer,
)
from .permissions import IsAdmin, IsAdminOrAgent, IsOwnerOrAdmin

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint de connexion personnalisé.
    
    Retourne les tokens JWT + les informations utilisateur.
    
    POST /api/accounts/login/
    
    Request body:
        {
            "email": "user@example.com",
            "password": "password123"
        }
    
    Response:
        {
            "access": "eyJ...",
            "refresh": "eyJ...",
            "user": {
                "id": 1,
                "email": "user@example.com",
                "role": "agent",
                ...
            }
        }
    """
    
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Endpoint pour consulter et modifier son propre profil.
    
    GET /api/accounts/profile/
        Retourne les informations du profil connecté
    
    PATCH /api/accounts/profile/
        Met à jour les informations du profil
        
    Request body (PATCH):
        {
            "first_name": "Nouveau prénom",
            "last_name": "Nouveau nom",
            "phone": "+33612345678"
        }
    """
    
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """Retourne l'utilisateur connecté."""
        return self.request.user
    
    def get_serializer_class(self):
        """Utilise le sérialiseur approprié selon la méthode."""
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class ChangePasswordView(APIView):
    """
    Endpoint pour changer son mot de passe.
    
    POST /api/accounts/change-password/
    
    Request body:
        {
            "old_password": "ancien_mdp",
            "new_password": "nouveau_mdp"
        }
    
    Response:
        {"message": "Mot de passe modifié avec succès"}
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Traite la demande de changement de mot de passe."""
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            # Mettre à jour le mot de passe
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            return Response(
                {'message': 'Mot de passe modifié avec succès'},
                status=status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListView(generics.ListAPIView):
    """
    Endpoint pour lister les utilisateurs (admin uniquement).
    
    GET /api/accounts/users/
    
    Query params:
        - role: Filtrer par rôle (admin, agent, tenant)
        - search: Rechercher par nom ou email
    
    Response:
        [
            {
                "id": 1,
                "email": "user@example.com",
                "first_name": "John",
                ...
            }
        ]
    """
    
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        """Retourne la liste des utilisateurs avec filtres."""
        queryset = User.objects.all()
        
        # Filtre par rôle
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        
        # Recherche par nom ou email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(email__icontains=search) |
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search)
            )
        
        return queryset


class AgentListView(generics.ListAPIView):
    """
    Endpoint pour lister les agents (admin uniquement).
    
    GET /api/accounts/agents/
    
    Response:
        Liste des utilisateurs avec le rôle "agent"
    """
    
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        """Retourne la liste des agents immobiliers."""
        return User.objects.filter(role='agent')


class AgentCreateView(generics.CreateAPIView):
    """
    Endpoint pour créer un agent immobilier (admin uniquement).
    
    POST /api/accounts/agents/create/
    
    Request body:
        {
            "email": "agent@example.com",
            "first_name": "Marie",
            "last_name": "Dupont",
            "phone": "+33612345678"
        }
    
    Response:
        {
            "id": 2,
            "email": "agent@example.com",
            "generated_password": "Ab3$xY7z!9Kl"
            ...
        }
    """
    
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdmin]
    
    def perform_create(self, serializer):
        """Force le rôle 'agent' lors de la création."""
        serializer.save(role='agent')


class TenantCreateView(generics.CreateAPIView):
    """
    Endpoint pour créer un locataire (agent uniquement).
    
    POST /api/accounts/tenants/create/
    
    Génère automatiquement les identifiants de connexion.
    
    Request body:
        {
            "email": "locataire@example.com",
            "first_name": "Pierre",
            "last_name": "Martin",
            "phone": "+33698765432"
        }
    
    Response:
        {
            "id": 3,
            "email": "locataire@example.com",
            "generated_password": "Xy9$kL2m!4Np"
            ...
        }
    """
    
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminOrAgent]
    
    def perform_create(self, serializer):
        """Force le rôle 'tenant' lors de la création."""
        serializer.save(role='tenant')


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Endpoint pour gérer un utilisateur spécifique.
    
    GET /api/accounts/users/<id>/
        Consulter un utilisateur
    
    PATCH /api/accounts/users/<id>/
        Modifier un utilisateur
    
    DELETE /api/accounts/users/<id>/
        Supprimer un utilisateur
    """
    
    queryset = User.objects.all()
    permission_classes = [IsAdmin]
    
    def get_serializer_class(self):
        """Utilise le sérialiseur approprié selon la méthode."""
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class DashboardStatsView(APIView):
    """
    Endpoint pour les statistiques du tableau de bord.
    
    GET /api/accounts/stats/
    
    Response (selon le rôle):
        Admin:
            {
                "total_users": 150,
                "total_agents": 10,
                "total_tenants": 140
            }
        
        Agent:
            {
                "total_properties": 25,
                "total_tenants": 45,
                "occupancy_rate": 0.85
            }
    """
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Retourne les statistiques selon le rôle de l'utilisateur."""
        user = request.user
        
        if user.role == 'admin':
            # Statistiques admin
            stats = {
                'total_users': User.objects.count(),
                'total_agents': User.objects.filter(role='agent').count(),
                'total_tenants': User.objects.filter(role='tenant').count(),
            }
        elif user.role == 'agent':
            # Statistiques agent (sera complété avec les autres modèles)
            stats = {
                'message': 'Statistiques agent - À implémenter avec les modèles properties'
            }
        else:
            # Statistiques tenant
            stats = {
                'message': 'Statistiques locataire - À implémenter'
            }
        
        return Response(stats)
