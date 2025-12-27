/**
 * Service API pour la gestion des propriétés
 * CRUD complet + statistiques
 */

import api from '@/lib/api';
import type { 
  Property, 
  PropertyCreateRequest, 
  PropertyStats,
  PaginatedResponse 
} from '@/types/api';

export const propertiesService = {
  /**
   * Liste des propriétés avec pagination
   */
  async getAll(params?: {
    page?: number;
    search?: string;
    status?: string;
  }): Promise<PaginatedResponse<Property>> {
    const response = await api.get<PaginatedResponse<Property>>('/properties/', { params });
    return response.data;
  },

  /**
   * Récupérer une propriété par ID
   */
  async getById(id: number): Promise<Property> {
    const response = await api.get<Property>(`/properties/${id}/`);
    return response.data;
  },

  /**
   * Créer une nouvelle propriété
   */
  async create(data: PropertyCreateRequest): Promise<Property> {
    const response = await api.post<Property>('/properties/create/', data);
    return response.data;
  },

  /**
   * Mettre à jour une propriété
   */
  async update(id: number, data: Partial<PropertyCreateRequest>): Promise<Property> {
    const response = await api.patch<Property>(`/properties/${id}/`, data);
    return response.data;
  },

  /**
   * Supprimer une propriété
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/properties/${id}/`);
  },

  /**
   * Statistiques des propriétés
   */
  async getStats(): Promise<PropertyStats> {
    const response = await api.get<PropertyStats>('/properties/stats/');
    return response.data;
  },
};

export default propertiesService;
