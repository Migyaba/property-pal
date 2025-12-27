"""
Permissions personnalisées pour l'application accounts.
Définit les règles d'accès basées sur les rôles utilisateur.
"""

from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission accordée uniquement aux administrateurs.
    
    Utilisée pour les actions de supervision globale :
    - Gestion des agents
    - Statistiques globales
    - Configuration système
    """
    
    message = "Accès réservé aux administrateurs."
    
    def has_permission(self, request, view):
        """Vérifie si l'utilisateur est un administrateur authentifié."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'admin'
        )


class IsAgent(permissions.BasePermission):
    """
    Permission accordée uniquement aux agents immobiliers.
    
    Utilisée pour les actions de gestion immobilière :
    - Création de biens
    - Gestion des locataires
    - Suivi des paiements
    """
    
    message = "Accès réservé aux agents immobiliers."
    
    def has_permission(self, request, view):
        """Vérifie si l'utilisateur est un agent authentifié."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'agent'
        )


class IsTenant(permissions.BasePermission):
    """
    Permission accordée uniquement aux locataires.
    
    Utilisée pour les actions propres aux locataires :
    - Consultation du logement
    - Paiement du loyer
    - Historique des paiements
    """
    
    message = "Accès réservé aux locataires."
    
    def has_permission(self, request, view):
        """Vérifie si l'utilisateur est un locataire authentifié."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'tenant'
        )


class IsAdminOrAgent(permissions.BasePermission):
    """
    Permission accordée aux administrateurs et agents.
    
    Utilisée pour les actions de gestion partagées entre admin et agents.
    """
    
    message = "Accès réservé aux administrateurs et agents."
    
    def has_permission(self, request, view):
        """Vérifie si l'utilisateur est admin ou agent."""
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role in ['admin', 'agent']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission pour accéder à ses propres ressources ou être admin.
    
    Utilisée pour les actions sur le profil utilisateur :
    - L'utilisateur peut voir/modifier son propre profil
    - L'admin peut voir/modifier tous les profils
    """
    
    message = "Vous ne pouvez accéder qu'à vos propres ressources."
    
    def has_object_permission(self, request, view, obj):
        """
        Vérifie si l'utilisateur peut accéder à l'objet.
        
        Args:
            request: Requête HTTP
            view: Vue appelée
            obj: Objet à vérifier (doit avoir un attribut 'user' ou être un User)
            
        Returns:
            bool: True si accès autorisé
        """
        if request.user.role == 'admin':
            return True
        
        # Si l'objet est un utilisateur
        if hasattr(obj, 'id') and hasattr(request.user, 'id'):
            return obj.id == request.user.id
        
        # Si l'objet a une relation 'user'
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
