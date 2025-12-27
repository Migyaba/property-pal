"""
Sérialiseurs pour l'application properties.
Convertissent les modèles Property en JSON et valident les données entrantes.
"""

from rest_framework import serializers
from .models import Property
from apps.accounts.serializers import UserSerializer


class PropertySerializer(serializers.ModelSerializer):
    """
    Sérialiseur complet pour afficher les détails d'un bien.
    Inclut les informations de l'agent et les données calculées.
    """
    
    # Champs calculés
    full_address = serializers.ReadOnlyField()
    total_rent = serializers.ReadOnlyField()
    current_tenants_count = serializers.ReadOnlyField()
    
    # Relation agent (lecture seule)
    agent_details = UserSerializer(source='agent', read_only=True)
    
    # Affichage du type de bien en français
    property_type_display = serializers.CharField(
        source='get_property_type_display',
        read_only=True
    )
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'address', 'city', 'postal_code', 'full_address',
            'property_type', 'property_type_display', 'surface', 'rooms',
            'monthly_rent', 'charges', 'total_rent', 'description',
            'agent', 'agent_details', 'is_available',
            'current_tenants_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PropertyCreateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la création et modification d'un bien.
    L'agent est automatiquement assigné à l'utilisateur connecté.
    """
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'address', 'city', 'postal_code',
            'property_type', 'surface', 'rooms',
            'monthly_rent', 'charges', 'description', 'is_available'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        """
        Crée un nouveau bien en assignant l'agent connecté.
        
        Args:
            validated_data: Données validées du formulaire
            
        Returns:
            Property: Instance du bien créé
        """
        # L'agent est l'utilisateur connecté (défini dans la vue)
        return super().create(validated_data)


class PropertyListSerializer(serializers.ModelSerializer):
    """
    Sérialiseur allégé pour la liste des biens.
    Optimisé pour les performances avec moins de champs.
    """
    
    full_address = serializers.ReadOnlyField()
    total_rent = serializers.ReadOnlyField()
    current_tenants_count = serializers.ReadOnlyField()
    property_type_display = serializers.CharField(
        source='get_property_type_display',
        read_only=True
    )
    
    class Meta:
        model = Property
        fields = [
            'id', 'name', 'full_address', 'city',
            'property_type', 'property_type_display',
            'monthly_rent', 'total_rent', 'is_available',
            'current_tenants_count'
        ]


class PropertyStatsSerializer(serializers.Serializer):
    """
    Sérialiseur pour les statistiques des biens d'un agent.
    """
    
    total_properties = serializers.IntegerField()
    available_properties = serializers.IntegerField()
    rented_properties = serializers.IntegerField()
    total_monthly_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    occupancy_rate = serializers.FloatField()
