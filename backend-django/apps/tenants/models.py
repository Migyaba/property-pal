"""
Modèles pour la gestion des locataires et leurs assignations aux biens.
Gère la relation entre locataires et propriétés.
"""

from django.db import models
from django.conf import settings
from apps.properties.models import Property


class TenantAssignment(models.Model):
    """
    Modèle représentant l'assignation d'un locataire à un bien.
    
    Gère la relation locataire-bien avec les dates de début/fin de bail.
    Un locataire peut avoir plusieurs assignations (historique),
    mais une seule active à la fois.
    
    Attributes:
        tenant: Le locataire (utilisateur avec rôle 'tenant')
        property: Le bien immobilier loué
        agent: L'agent qui a créé l'assignation
        start_date: Date de début du bail
        end_date: Date de fin du bail (optionnelle pour bail indéterminé)
        rent_amount: Montant du loyer convenu (peut différer du loyer standard)
        deposit: Montant du dépôt de garantie
        is_active: Indique si l'assignation est en cours
        notes: Notes internes sur la location
    """
    
    # Relations principales
    tenant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tenant_assignments',
        verbose_name='Locataire',
        limit_choices_to={'role': 'tenant'},
        help_text="Locataire assigné au bien"
    )
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='tenant_assignments',
        verbose_name='Bien immobilier',
        help_text="Bien immobilier loué"
    )
    
    agent = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_assignments',
        verbose_name='Agent créateur',
        limit_choices_to={'role': 'agent'},
        help_text="Agent ayant créé l'assignation"
    )
    
    # Dates du bail
    start_date = models.DateField(
        'Date de début du bail',
        help_text="Date d'entrée dans le logement"
    )
    end_date = models.DateField(
        'Date de fin du bail',
        null=True,
        blank=True,
        help_text="Date de fin prévue (vide pour bail indéterminé)"
    )
    
    # Montants
    rent_amount = models.DecimalField(
        'Loyer mensuel (€)',
        max_digits=10,
        decimal_places=2,
        help_text="Montant du loyer mensuel pour ce locataire"
    )
    deposit = models.DecimalField(
        'Dépôt de garantie (€)',
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Montant du dépôt de garantie versé"
    )
    
    # Statut
    is_active = models.BooleanField(
        'Bail actif',
        default=True,
        help_text="Indique si le bail est actuellement en cours"
    )
    
    # Informations supplémentaires
    notes = models.TextField(
        'Notes',
        blank=True,
        help_text="Notes internes sur la location"
    )
    
    # Timestamps
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Assignation locataire'
        verbose_name_plural = 'Assignations locataires'
        ordering = ['-start_date']
        
        # Un locataire ne peut avoir qu'une seule assignation active par bien
        constraints = [
            models.UniqueConstraint(
                fields=['tenant', 'property'],
                condition=models.Q(is_active=True),
                name='unique_active_tenant_property'
            )
        ]
    
    def __str__(self):
        """Représentation textuelle de l'assignation."""
        status = "actif" if self.is_active else "terminé"
        return f"{self.tenant.get_full_name()} → {self.property.name} ({status})"
    
    def save(self, *args, **kwargs):
        """
        Surcharge de la sauvegarde pour mettre à jour la disponibilité du bien.
        """
        super().save(*args, **kwargs)
        
        # Mettre à jour la disponibilité du bien
        has_active_tenants = self.property.tenant_assignments.filter(
            is_active=True
        ).exists()
        self.property.is_available = not has_active_tenants
        self.property.save(update_fields=['is_available'])
