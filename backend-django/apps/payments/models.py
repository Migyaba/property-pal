"""
Modèles pour la gestion des paiements de loyer.
Gère les échéances, paiements et reçus.
"""

from django.db import models
from django.conf import settings
from apps.tenants.models import TenantAssignment
from datetime import date
import uuid


class Payment(models.Model):
    """
    Modèle représentant un paiement de loyer.
    
    Chaque paiement est lié à une assignation locataire-bien.
    Gère les statuts (payé, en attente, en retard) et génère des reçus.
    
    Attributes:
        assignment: Assignation locataire-bien concernée
        amount: Montant du paiement
        due_date: Date d'échéance du loyer
        payment_date: Date effective du paiement
        status: Statut du paiement (paid, pending, overdue)
        payment_method: Méthode de paiement utilisée
        reference: Référence unique du paiement
        receipt_number: Numéro de reçu (généré après paiement)
        notes: Notes sur le paiement
    """
    
    class Status(models.TextChoices):
        """Énumération des statuts de paiement."""
        PAID = 'paid', 'Payé'
        PENDING = 'pending', 'En attente'
        OVERDUE = 'overdue', 'En retard'
    
    class PaymentMethod(models.TextChoices):
        """Énumération des méthodes de paiement."""
        BANK_TRANSFER = 'bank_transfer', 'Virement bancaire'
        CARD = 'card', 'Carte bancaire'
        CHECK = 'check', 'Chèque'
        CASH = 'cash', 'Espèces'
        OTHER = 'other', 'Autre'
    
    # Relation avec l'assignation
    assignment = models.ForeignKey(
        TenantAssignment,
        on_delete=models.CASCADE,
        related_name='payments',
        verbose_name='Location',
        help_text="Assignation locataire-bien concernée"
    )
    
    # Montant et dates
    amount = models.DecimalField(
        'Montant (€)',
        max_digits=10,
        decimal_places=2,
        help_text="Montant du paiement"
    )
    due_date = models.DateField(
        'Date d\'échéance',
        help_text="Date limite de paiement"
    )
    payment_date = models.DateField(
        'Date de paiement',
        null=True,
        blank=True,
        help_text="Date effective du paiement"
    )
    
    # Statut et méthode
    status = models.CharField(
        'Statut',
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Statut actuel du paiement"
    )
    payment_method = models.CharField(
        'Méthode de paiement',
        max_length=20,
        choices=PaymentMethod.choices,
        null=True,
        blank=True,
        help_text="Méthode utilisée pour le paiement"
    )
    
    # Références
    reference = models.UUIDField(
        'Référence',
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text="Référence unique du paiement"
    )
    receipt_number = models.CharField(
        'Numéro de reçu',
        max_length=50,
        blank=True,
        help_text="Numéro du reçu de paiement"
    )
    
    # Notes
    notes = models.TextField(
        'Notes',
        blank=True,
        help_text="Notes sur le paiement"
    )
    
    # Timestamps
    created_at = models.DateTimeField('Date de création', auto_now_add=True)
    updated_at = models.DateTimeField('Dernière modification', auto_now=True)
    
    class Meta:
        verbose_name = 'Paiement'
        verbose_name_plural = 'Paiements'
        ordering = ['-due_date']
        
        # Index pour les requêtes fréquentes
        indexes = [
            models.Index(fields=['status', 'due_date']),
            models.Index(fields=['assignment', 'due_date']),
        ]
    
    def __str__(self):
        """Représentation textuelle du paiement."""
        return f"Paiement {self.reference} - {self.amount}€ ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        """
        Surcharge de la sauvegarde pour :
        - Mettre à jour automatiquement le statut en retard
        - Générer le numéro de reçu lors du paiement
        """
        # Mise à jour du statut en retard
        if self.status == self.Status.PENDING and self.due_date < date.today():
            self.status = self.Status.OVERDUE
        
        # Génération du reçu lors du paiement
        if self.status == self.Status.PAID and not self.receipt_number:
            self.receipt_number = self.generate_receipt_number()
        
        super().save(*args, **kwargs)
    
    def generate_receipt_number(self):
        """Génère un numéro de reçu unique."""
        today = date.today()
        count = Payment.objects.filter(
            created_at__year=today.year,
            created_at__month=today.month,
            receipt_number__isnull=False
        ).exclude(receipt_number='').count() + 1
        
        return f"REC-{today.year}{today.month:02d}-{count:04d}"
    
    @property
    def is_late(self):
        """Vérifie si le paiement est en retard."""
        return self.status != self.Status.PAID and self.due_date < date.today()
    
    @property
    def tenant(self):
        """Retourne le locataire associé."""
        return self.assignment.tenant
    
    @property
    def property(self):
        """Retourne le bien associé."""
        return self.assignment.property


class PaymentReminder(models.Model):
    """
    Modèle pour les rappels de paiement.
    Trace l'historique des rappels envoyés aux locataires.
    """
    
    class ReminderType(models.TextChoices):
        """Types de rappels."""
        UPCOMING = 'upcoming', 'Échéance proche'
        DUE = 'due', 'Jour d\'échéance'
        OVERDUE = 'overdue', 'Retard de paiement'
    
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name='reminders',
        verbose_name='Paiement'
    )
    
    reminder_type = models.CharField(
        'Type de rappel',
        max_length=10,
        choices=ReminderType.choices
    )
    
    sent_at = models.DateTimeField(
        'Date d\'envoi',
        auto_now_add=True
    )
    
    message = models.TextField(
        'Message envoyé',
        blank=True
    )
    
    class Meta:
        verbose_name = 'Rappel de paiement'
        verbose_name_plural = 'Rappels de paiement'
        ordering = ['-sent_at']
    
    def __str__(self):
        return f"Rappel {self.get_reminder_type_display()} - {self.payment}"
