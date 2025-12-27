"""
Sérialiseurs pour l'application payments.
Gère la conversion des paiements en JSON.
"""

from rest_framework import serializers
from .models import Payment, PaymentReminder
from apps.tenants.serializers import TenantAssignmentSerializer
from apps.accounts.serializers import UserSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour les paiements.
    Inclut les détails de l'assignation et les champs calculés.
    """
    
    # Détails de l'assignation
    tenant_name = serializers.SerializerMethodField()
    property_name = serializers.SerializerMethodField()
    property_address = serializers.SerializerMethodField()
    
    # Affichages formatés
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display',
        read_only=True
    )
    is_late = serializers.ReadOnlyField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'assignment', 'tenant_name', 'property_name', 'property_address',
            'amount', 'due_date', 'payment_date',
            'status', 'status_display', 'is_late',
            'payment_method', 'payment_method_display',
            'reference', 'receipt_number', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'reference', 'receipt_number', 'created_at', 'updated_at']
    
    def get_tenant_name(self, obj):
        """Retourne le nom complet du locataire."""
        return obj.tenant.get_full_name()
    
    def get_property_name(self, obj):
        """Retourne le nom du bien."""
        return obj.property.name
    
    def get_property_address(self, obj):
        """Retourne l'adresse du bien."""
        return obj.property.full_address


class PaymentCreateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la création d'un paiement / échéance.
    """
    
    class Meta:
        model = Payment
        fields = ['assignment', 'amount', 'due_date', 'notes']
    
    def validate_assignment(self, value):
        """Vérifie que l'assignation est active."""
        if not value.is_active:
            raise serializers.ValidationError(
                "L'assignation n'est plus active."
            )
        return value


class PaymentUpdateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour mettre à jour un paiement (enregistrer un paiement).
    """
    
    class Meta:
        model = Payment
        fields = ['status', 'payment_date', 'payment_method', 'notes']
    
    def validate(self, data):
        """Validations lors de l'enregistrement d'un paiement."""
        status = data.get('status')
        payment_date = data.get('payment_date')
        payment_method = data.get('payment_method')
        
        # Si le paiement est marqué comme payé
        if status == Payment.Status.PAID:
            if not payment_date:
                raise serializers.ValidationError({
                    'payment_date': "La date de paiement est requise pour un paiement effectué."
                })
            if not payment_method:
                raise serializers.ValidationError({
                    'payment_method': "La méthode de paiement est requise."
                })
        
        return data


class PaymentListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur allégé pour la liste des paiements.
    """
    
    tenant_name = serializers.SerializerMethodField()
    property_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_late = serializers.ReadOnlyField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'tenant_name', 'property_name',
            'amount', 'due_date', 'payment_date',
            'status', 'status_display', 'is_late', 'reference'
        ]
    
    def get_tenant_name(self, obj):
        return obj.tenant.get_full_name()
    
    def get_property_name(self, obj):
        return obj.property.name


class TenantPaymentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour l'interface locataire - ses paiements.
    """
    
    property_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    can_download_receipt = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'property_name', 'amount',
            'due_date', 'payment_date',
            'status', 'status_display',
            'receipt_number', 'can_download_receipt'
        ]
    
    def get_property_name(self, obj):
        return obj.property.name
    
    def get_can_download_receipt(self, obj):
        """Indique si le reçu peut être téléchargé."""
        return bool(obj.receipt_number)


class PaymentStatsSerializer(serializers.Serializer):
    """
    Sérialiseur pour les statistiques de paiement.
    """
    
    total_payments = serializers.IntegerField()
    paid_count = serializers.IntegerField()
    pending_count = serializers.IntegerField()
    overdue_count = serializers.IntegerField()
    total_collected = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_pending = serializers.DecimalField(max_digits=12, decimal_places=2)
    collection_rate = serializers.FloatField()
