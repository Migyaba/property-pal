"""
Configuration de l'interface d'administration Django pour les biens.
"""

from django.contrib import admin
from .models import Property


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """
    Configuration de l'admin pour le modèle Property.
    """
    
    # Colonnes affichées dans la liste
    list_display = [
        'name', 'city', 'property_type', 'monthly_rent',
        'is_available', 'agent', 'created_at'
    ]
    
    # Filtres
    list_filter = ['property_type', 'is_available', 'city', 'created_at']
    
    # Recherche
    search_fields = ['name', 'address', 'city', 'agent__email']
    
    # Tri
    ordering = ['-created_at']
    
    # Champs en lecture seule
    readonly_fields = ['created_at', 'updated_at']
    
    # Organisation des champs
    fieldsets = (
        ('Informations principales', {
            'fields': ('name', 'property_type', 'description')
        }),
        ('Adresse', {
            'fields': ('address', 'city', 'postal_code')
        }),
        ('Caractéristiques', {
            'fields': ('surface', 'rooms')
        }),
        ('Loyer et charges', {
            'fields': ('monthly_rent', 'charges')
        }),
        ('Statut et gestion', {
            'fields': ('agent', 'is_available')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
