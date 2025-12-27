/**
 * Hook React Query pour le dashboard
 * Récupère les statistiques globales
 */

import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services';

// Clés de cache
export const dashboardKeys = {
  stats: () => ['dashboard', 'stats'] as const,
};

/**
 * Hook pour récupérer les statistiques du dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getStats(),
    // Rafraîchir toutes les 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
