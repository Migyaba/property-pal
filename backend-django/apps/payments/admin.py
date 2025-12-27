"""
Configuration de l'interface d'administration Django pour les paiements.
"""

from django.contrib import admin
from .models import Payment, PaymentReminder


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Configuration de l'admin pour les paiements.
    """
    
    list_display = [
        'reference', 'get_tenant', 'get_property',
        'amount', 'due_date', 'status', 'payment_date'
    ]
    
    list_filter = ['status', 'payment_method', 'due_date']
    
    search_fields = [
        'reference', 'receipt_number',
        'assignment__tenant__email',
        'assignment__property__name'
    ]
    
    ordering = ['-due_date']
    
    readonly_fields = ['reference', 'receipt_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('assignment', 'amount', 'reference')
        }),
        ('Dates', {
            'fields': ('due_date', 'payment_date')
        }),
        ('Statut', {
            'fields': ('status', 'payment_method')
        }),
        ('Reçu', {
            'fields': ('receipt_number',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_tenant(self, obj):
        """Retourne le nom du locataire."""
        return obj.tenant.get_full_name()
    get_tenant.short_description = 'Locataire'
    
    def get_property(self, obj):
        """Retourne le nom du bien."""
        return obj.property.name
    get_property.short_description = 'Bien'


@admin.register(PaymentReminder)
class PaymentReminderAdmin(admin.ModelAdmin):
    """
    Configuration de l'admin pour les rappels de paiement.
    """
    
    list_display = ['payment', 'reminder_type', 'sent_at']
    list_filter = ['reminder_type', 'sent_at']
    ordering = ['-sent_at']
