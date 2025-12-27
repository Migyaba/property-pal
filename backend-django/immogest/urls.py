"""
Configuration des URLs principales du projet ImmoGest.
Ce fichier centralise toutes les routes de l'API.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # ==========================================================================
    # ADMINISTRATION DJANGO
    # ==========================================================================
    path('admin/', admin.site.urls),
    
    # ==========================================================================
    # AUTHENTIFICATION JWT
    # ==========================================================================
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ==========================================================================
    # APPLICATIONS API
    # ==========================================================================
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/tenants/', include('apps.tenants.urls')),
    path('api/payments/', include('apps.payments.urls')),
    
    # ==========================================================================
    # DOCUMENTATION API (OpenAPI / Swagger)
    # ==========================================================================
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Servir les fichiers médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
