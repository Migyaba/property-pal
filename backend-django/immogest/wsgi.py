"""
Configuration WSGI pour le projet ImmoGest.
Expose l'application WSGI comme variable de module nommée 'application'.
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'immogest.settings')

application = get_wsgi_application()
