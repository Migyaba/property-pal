"""Configuration de l'application accounts."""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Configuration pour l'application de gestion des comptes."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.accounts'
    verbose_name = 'Gestion des comptes'
