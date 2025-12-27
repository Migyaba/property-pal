/**
 * Hooks React Query pour les propriétés
 * Gère le cache et les mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesService } from '@/services';
import type { PropertyCreateRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Clés de cache
export const propertyKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyKeys.all, 'list'] as const,
  list: (params?: { page?: number; search?: string; status?: string }) => 
    [...propertyKeys.lists(), params] as const,
  details: () => [...propertyKeys.all, 'detail'] as const,
  detail: (id: number) => [...propertyKeys.details(), id] as const,
  stats: () => [...propertyKeys.all, 'stats'] as const,
};

/**
 * Hook pour récupérer la liste des propriétés
 */
export function useProperties(params?: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: propertyKeys.list(params),
    queryFn: () => propertiesService.getAll(params),
  });
}

/**
 * Hook pour récupérer une propriété par ID
 */
export function useProperty(id: number) {
  return useQuery({
    queryKey: propertyKeys.detail(id),
    queryFn: () => propertiesService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les statistiques des propriétés
 */
export function usePropertyStats() {
  return useQuery({
    queryKey: propertyKeys.stats(),
    queryFn: () => propertiesService.getStats(),
  });
}

/**
 * Hook pour créer une propriété
 */
export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PropertyCreateRequest) => propertiesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.stats() });
      toast({
        title: 'Bien créé',
        description: 'La propriété a été créée avec succès.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la propriété.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour mettre à jour une propriété
 */
export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PropertyCreateRequest> }) => 
      propertiesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
      toast({
        title: 'Bien modifié',
        description: 'La propriété a été mise à jour.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la propriété.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour supprimer une propriété
 */
export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => propertiesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: propertyKeys.stats() });
      toast({
        title: 'Bien supprimé',
        description: 'La propriété a été supprimée.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la propriété.',
        variant: 'destructive',
      });
    },
  });
}
