"""
Modèles pour la gestion des biens immobiliers.
Définit les structures de données pour les propriétés et leurs caractéristiques.
"""

from django.db import models
from django.conf import settings


class Property(models.Model):
    """
    Modèle représentant un bien immobilier.
    
    Chaque bien est géré par un agent immobilier et peut être loué
    à un ou plusieurs locataires.
    
    Attributes:
        name: Nom du bien (ex: "Appartement Haussmann")
        address: Adresse complète du bien
        city: Ville
        postal_code: Code postal
        property_type: Type de bien (appartement, maison, studio, etc.)
        surface: Surface en m²
        rooms: Nombre de pièces
        monthly_rent: Loyer mensuel en euros
        charges: Charges mensuelles en euros
        description: Description détaillée du bien
        agent: Agent immobilier responsable du bien
        is_available: Disponibilité du bien
        created_at: Date d'ajout du bien
        updated_at: Dernière modification
    """
    
    class PropertyType(models.TextChoices):
        """Énumération des types de biens immobiliers."""
        APARTMENT = 'apartment', 'Appartement'
        HOUSE = 'house', 'Maison'
        STUDIO = 'studio', 'Studio'
        LOFT = 'loft', 'Loft'
        COMMERCIAL = 'commercial', 'Local commercial'
        PARKING = 'parking', 'Parking'
        OTHER = 'other', 'Autre'
    
    # Informations principales
    name = models.CharField(
        'Nom du bien',
        max_length=200,
        help_text="Nom identifiant le bien (ex: Appartement Centre-ville)"
    )
    
    # Adresse
    address = models.CharField('Adresse', max_length=255)
    city = models.CharField('Ville', max_length=100)
    postal_code = models.CharField('Code postal', max_length=10)
    
    # Caractéristiques
    property_type = models.CharField(
        'Type de bien',
        max_length=20,
        choices=PropertyType.choices,
        default=PropertyType.APARTMENT
    )
    surface = models.DecimalField(
        'Surface (m²)',
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )
    rooms = models.PositiveIntegerField(
        'Nombre de pièces',
        null=True,
        blank=True
    )
    
    # Loyer et charges
    monthly_rent = models.DecimalField(
        'Loyer mensuel (€)',
        max_digits=10,
        decimal_places=2,
        help_text="Montant du loyer hors charges"
    )
    charges = models.DecimalField(
        'Charges mensuelles (€)',
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Montant des charges mensuelles"
    )
    
    # Description
    description = models.TextField(
        'Description',
        blank=True,
        help_text="Description détaillée du bien"
    )
    
    # Relations
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='properties',
        verbose_name='Agent responsable',
        limit_choices_to={'role': 'agent'},
        help_text="Agent immobilier gérant ce bien"
    )
    
    # Statut
    is_available = models.BooleanField(
        'Disponible',
        default=True,
        help_text="Indique si le bien est disponible à la location"
    )
    
    # Timestamps
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Bien immobilier'
        verbose_name_plural = 'Biens immobiliers'
        ordering = ['-created_at']
    
    def __str__(self):
        """Représentation textuelle du bien."""
        return f"{self.name} - {self.city}"
    
    @property
    def full_address(self):
        """Retourne l'adresse complète formatée."""
        return f"{self.address}, {self.postal_code} {self.city}"
    
    @property
    def total_rent(self):
        """Retourne le loyer total (loyer + charges)."""
        return self.monthly_rent + self.charges
    
    @property
    def current_tenants_count(self):
        """Retourne le nombre de locataires actuels."""
        return self.tenant_assignments.filter(is_active=True).count()
