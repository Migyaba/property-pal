"""Configuration de l'application payments."""

from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    """Configuration pour l'application de gestion des paiements."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.payments'
    verbose_name = 'Gestion des paiements'
