"""Configuration de l'application tenants."""

from django.apps import AppConfig


class TenantsConfig(AppConfig):
    """Configuration pour l'application de gestion des locataires."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.tenants'
    verbose_name = 'Gestion des locataires'
