/**
 * Hooks React Query pour les paiements
 * Gère les échéances et enregistrements de paiements
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsService } from '@/services';
import type { PaymentCreateRequest, RecordPaymentRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

// Clés de cache
export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params?: { page?: number; status?: string; tenant?: number }) => 
    [...paymentKeys.lists(), params] as const,
  detail: (id: number) => [...paymentKeys.all, 'detail', id] as const,
  stats: () => [...paymentKeys.all, 'stats'] as const,
  myPayments: () => [...paymentKeys.all, 'my-payments'] as const,
  myCurrent: () => [...paymentKeys.all, 'my-current'] as const,
};

/**
 * Hook pour récupérer la liste des paiements
 */
export function usePayments(params?: { page?: number; status?: string; tenant?: number }) {
  return useQuery({
    queryKey: paymentKeys.list(params),
    queryFn: () => paymentsService.getAll(params),
  });
}

/**
 * Hook pour récupérer un paiement par ID
 */
export function usePayment(id: number) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => paymentsService.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook pour récupérer les statistiques des paiements
 */
export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: () => paymentsService.getStats(),
  });
}

/**
 * Hook pour créer une échéance de paiement
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PaymentCreateRequest) => paymentsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      toast({
        title: 'Échéance créée',
        description: 'L\'échéance de paiement a été créée.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'échéance.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour enregistrer un paiement reçu
 */
export function useRecordPayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RecordPaymentRequest }) => 
      paymentsService.recordPayment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      toast({
        title: 'Paiement enregistré',
        description: 'Le paiement a été enregistré avec succès.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le paiement.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Hook pour générer les échéances mensuelles
 */
export function useGenerateMonthlyPayments() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => paymentsService.generateMonthly(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      toast({
        title: 'Échéances générées',
        description: `${data.created} échéances ont été créées.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les échéances.',
        variant: 'destructive',
      });
    },
  });
}

// ==========================================================================
// INTERFACE LOCATAIRE
// ==========================================================================

/**
 * Hook pour récupérer les paiements du locataire connecté
 */
export function useMyPayments() {
  return useQuery({
    queryKey: paymentKeys.myPayments(),
    queryFn: () => paymentsService.getMyPayments(),
  });
}

/**
 * Hook pour récupérer le paiement en cours du locataire
 */
export function useMyCurrentPayment() {
  return useQuery({
    queryKey: paymentKeys.myCurrent(),
    queryFn: () => paymentsService.getMyCurrent(),
  });
}

/**
 * Hook pour effectuer un paiement (locataire)
 */
export function useMakePayment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => paymentsService.makePayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.myPayments() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.myCurrent() });
      toast({
        title: 'Paiement effectué',
        description: 'Votre paiement a été enregistré.',
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'effectuer le paiement.',
        variant: 'destructive',
      });
    },
  });
}
