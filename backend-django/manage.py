#!/usr/bin/env python
"""
Script de gestion Django pour le projet ImmoGest.
Permet d'exécuter des commandes administratives comme:
- python manage.py runserver      : Démarrer le serveur de développement
- python manage.py migrate        : Appliquer les migrations de base de données
- python manage.py createsuperuser: Créer un administrateur
"""

import os
import sys


def main():
    """Point d'entrée principal pour les commandes Django."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'immogest.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Impossible d'importer Django. Vérifiez qu'il est installé et "
            "disponible dans votre variable d'environnement PYTHONPATH. "
            "Avez-vous activé votre environnement virtuel ?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
