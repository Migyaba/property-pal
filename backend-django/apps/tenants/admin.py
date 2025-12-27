"""
Configuration de l'interface d'administration Django pour les locataires.
"""

from django.contrib import admin
from .models import TenantAssignment


@admin.register(TenantAssignment)
class TenantAssignmentAdmin(admin.ModelAdmin):
    """
    Configuration de l'admin pour les assignations locataires.
    """
    
    list_display = [
        'tenant', 'property', 'rent_amount',
        'start_date', 'end_date', 'is_active', 'agent'
    ]
    
    list_filter = ['is_active', 'start_date', 'property__city']
    
    search_fields = [
        'tenant__email', 'tenant__first_name', 'tenant__last_name',
        'property__name', 'property__address'
    ]
    
    ordering = ['-start_date']
    
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Relation', {
            'fields': ('tenant', 'property', 'agent')
        }),
        ('Dates du bail', {
            'fields': ('start_date', 'end_date', 'is_active')
        }),
        ('Montants', {
            'fields': ('rent_amount', 'deposit')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    autocomplete_fields = ['tenant', 'property', 'agent']
