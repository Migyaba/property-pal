"""Configuration de l'application properties."""

from django.apps import AppConfig


class PropertiesConfig(AppConfig):
    """Configuration pour l'application de gestion des biens."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.properties'
    verbose_name = 'Gestion des biens immobiliers'
