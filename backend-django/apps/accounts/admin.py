"""
Configuration de l'interface d'administration Django pour les utilisateurs.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Configuration personnalisée de l'admin pour le modèle User.
    Adapte l'interface d'administration Django au modèle utilisateur personnalisé.
    """
    
    # Colonnes affichées dans la liste
    list_display = [
        'email', 'first_name', 'last_name', 'role',
        'is_active', 'created_at'
    ]
    
    # Filtres dans la barre latérale
    list_filter = ['role', 'is_active', 'is_staff', 'created_at']
    
    # Champs de recherche
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    
    # Tri par défaut
    ordering = ['-created_at']
    
    # Configuration des champs dans le formulaire de détail
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Informations personnelles', {
            'fields': ('first_name', 'last_name', 'phone')
        }),
        ('Rôle et permissions', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Groupes et permissions', {
            'fields': ('groups', 'user_permissions'),
            'classes': ('collapse',)  # Section repliée par défaut
        }),
        ('Dates importantes', {
            'fields': ('last_login', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Champs en lecture seule
    readonly_fields = ['created_at', 'updated_at', 'last_login']
    
    # Configuration du formulaire de création
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email', 'first_name', 'last_name',
                'role', 'phone', 'password1', 'password2'
            )
        }),
    )
