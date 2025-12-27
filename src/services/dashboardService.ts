/**
 * Service API pour le dashboard
 * Statistiques globales et données récentes
 */

import api from '@/lib/api';
import type { DashboardStats } from '@/types/api';

export const dashboardService = {
  /**
   * Récupérer les statistiques du dashboard
   */
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/accounts/dashboard-stats/');
    return response.data;
  },
};

export default dashboardService;
