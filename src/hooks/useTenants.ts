/**
 * Hooks React Query pour les locataires
 * Gère les utilisateurs locataires et leurs contrats
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantsService } from '@/services';
import type { CreateTenantRequest, TenantAssignmentCreateRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Clés de cache
export const tenantKeys = {
  all: ['tenants'] as const,
  lists: () => [...tenantKeys.all, 'list'] as const,
  list: (params?: { page?: number; search?: string }) => 
    [...tenantKeys.lists(), params] as const,
  assignments: () => [...tenantKeys.all, 'assignments'] as const,
  assignmentList: (params?: { tenant?: number; property?: number; is_active?: boolean }) =>
    [...tenantKeys.assignments(), params] as const,
  assignment: (id: number) => [...tenantKeys.assignments(), id] as const,
  myProperty: () => [...tenantKeys.all, 'my-property'] as const,
};

/**
 * Hook pour récupérer la liste des locataires
 */
export function useTenants(params?: { page?: number; search?: string }) {
  return useQuery({
    queryKey: tenantKeys.list(params),
    queryFn: () => tenantsService.getAll(params),
  });
}

/**
 * Hook pour récupérer les assignments
 */
export function useTenantAssignments(params?: { 
  tenant?: number; 
  property?: number; 
  is_active?: boolean 
}) {
  return useQuery({
    queryKey: tenantKeys.assignmentList(params),
    queryFn: () => tenantsService.getAssignments(params),
  });
}

/**
 * Hook pour récupérer un assignment par ID
 */
export function useTenantAssignment(id: number) {
  return useQuery({
    queryKey: tenantKeys.assignment(id),
    queryFn: () => tenantsService.getAssignmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook pour créer un nouveau locataire
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateTenantRequest) => tenantsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tenantKeys.assignments() });
      toast({
        title: 'Locataire créé',
        description: 'Le compte locataire a été créé avec succès.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le locataire.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour créer un assignment
 */
export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: TenantAssignmentCreateRequest) => tenantsService.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.assignments() });
      toast({
        title: 'Contrat créé',
        description: 'Le locataire a été assigné à la propriété.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer le contrat.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour terminer un assignment
 */
export function useEndAssignment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, endDate }: { id: number; endDate: string }) => 
      tenantsService.endAssignment(id, endDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.assignments() });
      toast({
        title: 'Contrat terminé',
        description: 'Le bail a été terminé avec succès.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer le contrat.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour récupérer la propriété du locataire connecté
 */
export function useMyProperty() {
  return useQuery({
    queryKey: tenantKeys.myProperty(),
    queryFn: () => tenantsService.getMyProperty(),
  });
}
