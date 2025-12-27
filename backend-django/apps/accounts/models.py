"""
Modèles pour la gestion des utilisateurs.
Définit le modèle User personnalisé avec les rôles (admin, agent, tenant).
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    """
    Manager personnalisé pour le modèle User.
    Gère la création des utilisateurs standards et superutilisateurs.
    """
    
    def create_user(self, email, password=None, **extra_fields):
        """
        Crée et retourne un utilisateur avec email et mot de passe.
        
        Args:
            email: Adresse email de l'utilisateur (identifiant unique)
            password: Mot de passe de l'utilisateur
            **extra_fields: Champs supplémentaires (first_name, last_name, etc.)
            
        Returns:
            User: Instance de l'utilisateur créé
            
        Raises:
            ValueError: Si l'email n'est pas fourni
        """
        if not email:
            raise ValueError("L'adresse email est obligatoire")
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """
        Crée et retourne un superutilisateur (administrateur Django).
        
        Args:
            email: Adresse email de l'administrateur
            password: Mot de passe de l'administrateur
            **extra_fields: Champs supplémentaires
            
        Returns:
            User: Instance du superutilisateur créé
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError("Le superutilisateur doit avoir is_staff=True")
        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Le superutilisateur doit avoir is_superuser=True")
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """
    Modèle utilisateur personnalisé pour ImmoGest.
    
    Utilise l'email comme identifiant principal au lieu du username.
    Définit trois rôles : admin, agent, tenant.
    
    Attributes:
        email: Adresse email unique (identifiant de connexion)
        role: Rôle de l'utilisateur (admin, agent, tenant)
        phone: Numéro de téléphone optionnel
        created_at: Date de création du compte
        updated_at: Date de dernière modification
    """
    
    class Role(models.TextChoices):
        """Énumération des rôles utilisateur."""
        ADMIN = 'admin', 'Administrateur'
        AGENT = 'agent', 'Agent immobilier'
        TENANT = 'tenant', 'Locataire'
    
    # Suppression du champ username, utilisation de l'email à la place
    username = None
    email = models.EmailField(
        'Adresse email',
        unique=True,
        help_text="Adresse email utilisée pour la connexion"
    )
    
    # Rôle de l'utilisateur
    role = models.CharField(
        'Rôle',
        max_length=10,
        choices=Role.choices,
        default=Role.TENANT,
        help_text="Rôle déterminant les permissions de l'utilisateur"
    )
    
    # Informations supplémentaires
    phone = models.CharField(
        'Téléphone',
        max_length=20,
        blank=True,
        null=True,
        help_text="Numéro de téléphone de contact"
    )
    
    # Timestamps
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière modification', auto_now=True)
    
    # Configuration du modèle
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    objects = UserManager()
    
    class Meta:
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']
    
    def __str__(self):
        """Représentation textuelle de l'utilisateur."""
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def is_admin(self):
        """Vérifie si l'utilisateur est administrateur."""
        return self.role == self.Role.ADMIN
    
    @property
    def is_agent(self):
        """Vérifie si l'utilisateur est agent immobilier."""
        return self.role == self.Role.AGENT
    
    @property
    def is_tenant(self):
        """Vérifie si l'utilisateur est locataire."""
        return self.role == self.Role.TENANT
