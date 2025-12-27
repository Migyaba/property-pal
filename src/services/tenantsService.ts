/**
 * Service API pour la gestion des locataires
 * Gère les utilisateurs locataires et leurs assignments
 */

import api from '@/lib/api';
import type { 
  User,
  TenantAssignment,
  TenantAssignmentCreateRequest,
  CreateTenantRequest,
  CreateTenantResponse,
  PaginatedResponse 
} from '@/types/api';

export const tenantsService = {
  /**
   * Liste des locataires
   */
  async getAll(params?: {
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/tenants/', { params });
    return response.data;
  },

  /**
   * Créer un nouveau locataire avec compte utilisateur
   */
  async create(data: CreateTenantRequest): Promise<CreateTenantResponse> {
    const response = await api.post<CreateTenantResponse>('/accounts/tenants/create/', data);
    return response.data;
  },

  /**
   * Liste des assignments (contrats locataire-propriété)
   */
  async getAssignments(params?: {
    page?: number;
    tenant?: number;
    property?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<TenantAssignment>> {
    const response = await api.get<PaginatedResponse<TenantAssignment>>('/tenants/assignments/', { params });
    return response.data;
  },

  /**
   * Créer un assignment
   */
  async createAssignment(data: TenantAssignmentCreateRequest): Promise<TenantAssignment> {
    const response = await api.post<TenantAssignment>('/tenants/assignments/create/', data);
    return response.data;
  },

  /**
   * Récupérer un assignment par ID
   */
  async getAssignmentById(id: number): Promise<TenantAssignment> {
    const response = await api.get<TenantAssignment>(`/tenants/assignments/${id}/`);
    return response.data;
  },

  /**
   * Mettre à jour un assignment
   */
  async updateAssignment(id: number, data: Partial<TenantAssignmentCreateRequest>): Promise<TenantAssignment> {
    const response = await api.patch<TenantAssignment>(`/tenants/assignments/${id}/`, data);
    return response.data;
  },

  /**
   * Terminer un assignment (fin de bail)
   */
  async endAssignment(id: number, endDate: string): Promise<TenantAssignment> {
    const response = await api.post<TenantAssignment>(`/tenants/assignments/${id}/end/`, {
      end_date: endDate,
    });
    return response.data;
  },

  /**
   * Récupérer la propriété du locataire connecté
   */
  async getMyProperty(): Promise<TenantAssignment> {
    const response = await api.get<TenantAssignment>('/tenants/my-property/');
    return response.data;
  },
};

export default tenantsService;
