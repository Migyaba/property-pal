"""
Sérialiseurs pour l'application accounts.
Convertissent les modèles en JSON et valident les données entrantes.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
import secrets
import string

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour afficher les informations utilisateur.
    Utilisé pour les réponses API (lecture seule pour les champs sensibles).
    """
    
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'phone', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Retourne le nom complet de l'utilisateur."""
        return obj.get_full_name()


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la création d'utilisateurs.
    Utilisé par les administrateurs et agents pour créer des comptes.
    """
    
    password = serializers.CharField(
        write_only=True,
        required=False,
        help_text="Mot de passe (généré automatiquement si non fourni)"
    )
    generated_password = serializers.CharField(
        read_only=True,
        help_text="Mot de passe généré (affiché une seule fois)"
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'role', 'phone', 'password', 'generated_password'
        ]
        read_only_fields = ['id']
    
    def generate_password(self, length=12):
        """
        Génère un mot de passe sécurisé aléatoire.
        
        Args:
            length: Longueur du mot de passe (défaut: 12)
            
        Returns:
            str: Mot de passe généré contenant lettres, chiffres et symboles
        """
        alphabet = string.ascii_letters + string.digits + "!@#$%"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def create(self, validated_data):
        """
        Crée un nouvel utilisateur avec génération automatique de mot de passe.
        
        Args:
            validated_data: Données validées du formulaire
            
        Returns:
            User: Instance de l'utilisateur créé
        """
        # Générer un mot de passe si non fourni
        password = validated_data.pop('password', None)
        if not password:
            password = self.generate_password()
            self._generated_password = password
        else:
            self._generated_password = None
        
        # Créer l'utilisateur
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        return user
    
    def to_representation(self, instance):
        """
        Personnalise la représentation JSON de l'utilisateur.
        Inclut le mot de passe généré si applicable.
        """
        data = super().to_representation(instance)
        
        # Inclure le mot de passe généré (uniquement à la création)
        if hasattr(self, '_generated_password') and self._generated_password:
            data['generated_password'] = self._generated_password
        
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Sérialiseur pour la mise à jour des informations utilisateur.
    Permet de modifier les informations de profil.
    """
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'phone']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Sérialiseur pour le changement de mot de passe.
    Vérifie l'ancien mot de passe avant d'appliquer le nouveau.
    """
    
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    
    def validate_old_password(self, value):
        """Vérifie que l'ancien mot de passe est correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Sérialiseur personnalisé pour l'obtention des tokens JWT.
    Ajoute les informations utilisateur dans la réponse.
    """
    
    def validate(self, attrs):
        """
        Valide les credentials et retourne les tokens avec les infos utilisateur.
        
        Returns:
            dict: Tokens JWT + informations utilisateur
        """
        data = super().validate(attrs)
        
        # Ajouter les informations utilisateur à la réponse
        user_data = UserSerializer(self.user).data
        data['user'] = user_data
        
        return data
