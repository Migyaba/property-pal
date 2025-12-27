"""
Sérialiseurs pour l'application tenants.
Gère la conversion des assignations locataires en JSON.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import TenantAssignment
from apps.properties.serializers import PropertyListSerializer
from apps.accounts.serializers import UserSerializer

User = get_user_model()


class TenantAssignmentSerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour les assignations locataires.
    Inclut les détails du locataire et de la propriété.
    """
    
    tenant_details = UserSerializer(source='tenant', read_only=True)
    property_details = PropertyListSerializer(source='property', read_only=True)
    agent_details = UserSerializer(source='agent', read_only=True)
    
    class Meta:
        model = TenantAssignment
        fields = [
            'id', 'tenant', 'tenant_details',
            'property', 'property_details',
            'agent', 'agent_details',
            'start_date', 'end_date',
            'rent_amount', 'deposit',
            'is_active', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'agent', 'created_at', 'updated_at']


class TenantAssignmentCreateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la création d'une assignation locataire.
    """
    
    class Meta:
        model = TenantAssignment
        fields = [
            'tenant', 'property',
            'start_date', 'end_date',
            'rent_amount', 'deposit', 'notes'
        ]
    
    def validate_tenant(self, value):
        """Vérifie que l'utilisateur est bien un locataire."""
        if value.role != 'tenant':
            raise serializers.ValidationError(
                "L'utilisateur sélectionné n'est pas un locataire."
            )
        return value
    
    def validate(self, data):
        """Validations croisées."""
        # Vérifier que le bien appartient à l'agent
        request = self.context.get('request')
        if request and request.user.role == 'agent':
            property_obj = data.get('property')
            if property_obj and property_obj.agent != request.user:
                raise serializers.ValidationError({
                    'property': "Vous ne pouvez assigner des locataires qu'à vos propres biens."
                })
        
        # Vérifier les dates
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({
                'end_date': "La date de fin doit être postérieure à la date de début."
            })
        
        return data


class TenantListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la liste des locataires avec leurs assignations.
    """
    
    current_property = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'phone', 'is_active', 'current_property', 'created_at'
        ]
    
    def get_current_property(self, obj):
        """Retourne le bien actuellement loué par le locataire."""
        active_assignment = obj.tenant_assignments.filter(is_active=True).first()
        if active_assignment:
            return {
                'id': active_assignment.property.id,
                'name': active_assignment.property.name,
                'address': active_assignment.property.full_address,
                'rent_amount': float(active_assignment.rent_amount)
            }
        return None


class TenantPropertyViewSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour l'interface locataire - vue de son logement.
    Affiche les détails du bien loué et les informations de paiement.
    """
    
    property_details = serializers.SerializerMethodField()
    agent_contact = serializers.SerializerMethodField()
    
    class Meta:
        model = TenantAssignment
        fields = [
            'id', 'property_details', 'agent_contact',
            'start_date', 'end_date',
            'rent_amount', 'deposit', 'is_active'
        ]
    
    def get_property_details(self, obj):
        """Retourne les détails du bien loué."""
        prop = obj.property
        return {
            'id': prop.id,
            'name': prop.name,
            'address': prop.full_address,
            'property_type': prop.get_property_type_display(),
            'surface': float(prop.surface) if prop.surface else None,
            'rooms': prop.rooms,
            'charges': float(prop.charges),
            'total_rent': float(obj.rent_amount) + float(prop.charges)
        }
    
    def get_agent_contact(self, obj):
        """Retourne les informations de contact de l'agent."""
        agent = obj.property.agent
        return {
            'name': agent.get_full_name(),
            'email': agent.email,
            'phone': agent.phone
        }
