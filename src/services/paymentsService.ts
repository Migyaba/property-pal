/**
 * Service API pour la gestion des paiements
 * Gère les échéances et enregistrements de paiements
 */

import api from '@/lib/api';
import type { 
  Payment, 
  PaymentCreateRequest, 
  RecordPaymentRequest,
  PaymentStats,
  PaginatedResponse 
} from '@/types/api';

export const paymentsService = {
  /**
   * Liste des paiements avec filtres
   */
  async getAll(params?: {
    page?: number;
    status?: string;
    tenant?: number;
    property?: number;
  }): Promise<PaginatedResponse<Payment>> {
    const response = await api.get<PaginatedResponse<Payment>>('/payments/', { params });
    return response.data;
  },

  /**
   * Récupérer un paiement par ID
   */
  async getById(id: number): Promise<Payment> {
    const response = await api.get<Payment>(`/payments/${id}/`);
    return response.data;
  },

  /**
   * Créer une échéance de paiement
   */
  async create(data: PaymentCreateRequest): Promise<Payment> {
    const response = await api.post<Payment>('/payments/create/', data);
    return response.data;
  },

  /**
   * Enregistrer un paiement reçu
   */
  async recordPayment(id: number, data: RecordPaymentRequest): Promise<Payment> {
    const response = await api.post<Payment>(`/payments/${id}/record/`, data);
    return response.data;
  },

  /**
   * Générer les échéances mensuelles
   */
  async generateMonthly(): Promise<{ created: number; message: string }> {
    const response = await api.post<{ created: number; message: string }>('/payments/generate-monthly/');
    return response.data;
  },

  /**
   * Statistiques des paiements
   */
  async getStats(): Promise<PaymentStats> {
    const response = await api.get<PaymentStats>('/payments/stats/');
    return response.data;
  },

  // ==========================================================================
  // INTERFACE LOCATAIRE
  // ==========================================================================

  /**
   * Liste des paiements du locataire connecté
   */
  async getMyPayments(): Promise<Payment[]> {
    const response = await api.get<Payment[]>('/payments/my-payments/');
    return response.data;
  },

  /**
   * Paiement en cours du locataire
   */
  async getMyCurrent(): Promise<Payment | null> {
    const response = await api.get<Payment | null>('/payments/my-current/');
    return response.data;
  },

  /**
   * Effectuer un paiement (locataire)
   */
  async makePayment(id: number): Promise<Payment> {
    const response = await api.post<Payment>(`/payments/${id}/pay/`);
    return response.data;
  },
};

export default paymentsService;
