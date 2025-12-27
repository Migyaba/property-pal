"""
Configuration des URLs pour l'application payments.
Définit les endpoints de gestion des paiements.
"""

from django.urls import path
from .views import (
    PaymentListView,
    PaymentCreateView,
    PaymentDetailView,
    RecordPaymentView,
    GenerateMonthlyPaymentsView,
    PaymentStatsView,
    MyPaymentsView,
    MyCurrentPaymentView,
    MakePaymentView,
)

app_name = 'payments'

urlpatterns = [
    # ==========================================================================
    # GESTION DES PAIEMENTS (AGENT/ADMIN)
    # ==========================================================================
    
    # GET /api/payments/
    # Liste des paiements
    path('', PaymentListView.as_view(), name='payment_list'),
    
    # POST /api/payments/create/
    # Créer une échéance de paiement
    path('create/', PaymentCreateView.as_view(), name='payment_create'),
    
    # GET, PATCH /api/payments/<id>/
    # Consulter ou modifier un paiement
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    
    # POST /api/payments/<id>/record/
    # Enregistrer un paiement reçu
    path('<int:pk>/record/', RecordPaymentView.as_view(), name='payment_record'),
    
    # POST /api/payments/generate-monthly/
    # Générer les échéances mensuelles
    path('generate-monthly/', GenerateMonthlyPaymentsView.as_view(), name='generate_monthly'),
    
    # GET /api/payments/stats/
    # Statistiques de paiement
    path('stats/', PaymentStatsView.as_view(), name='payment_stats'),
    
    # ==========================================================================
    # INTERFACE LOCATAIRE
    # ==========================================================================
    
    # GET /api/payments/my-payments/
    # Liste des paiements du locataire
    path('my-payments/', MyPaymentsView.as_view(), name='my_payments'),
    
    # GET /api/payments/my-current/
    # Paiement en cours du locataire
    path('my-current/', MyCurrentPaymentView.as_view(), name='my_current'),
    
    # POST /api/payments/<id>/pay/
    # Effectuer un paiement (locataire)
    path('<int:pk>/pay/', MakePaymentView.as_view(), name='make_payment'),
]
