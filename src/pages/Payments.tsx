import { useState } from 'react';
import { Search, Check, Clock, AlertTriangle, Download, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingState, ErrorState } from '@/components/ui/LoadingState';
import { cn } from '@/lib/utils';
import { usePayments, usePaymentStats, useRecordPayment } from '@/hooks/usePayments';
import type { Payment, PaymentStatus } from '@/types/api';

const statusConfig: Record<PaymentStatus, { label: string; icon: typeof Check; className: string }> = {
  paid: { label: 'Payé', icon: Check, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'En attente', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'En retard', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  cancelled: { label: 'Annulé', icon: Clock, className: 'bg-muted text-muted-foreground border-border' },
};

const methodLabels: Record<string, string> = {
  bank_transfer: 'Virement',
  card: 'Carte',
  cash: 'Espèces',
  check: 'Chèque',
  other: 'Autre',
};

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: paymentsData, isLoading, isError, refetch } = usePayments({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { data: stats } = usePaymentStats();
  const recordPayment = useRecordPayment();

  const payments = paymentsData?.results ?? [];

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.tenant_name.toLowerCase().includes(q) || p.property_name.toLowerCase().includes(q);
  });

  return (
    <DashboardLayout title="Suivi des paiements" subtitle="Gérez les loyers et suivez les paiements">
      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm text-muted-foreground">Total attendu</p>
          <p className="text-2xl font-bold text-foreground">{(stats?.total_expected ?? 0).toLocaleString()} €</p>
        </div>
        <div className="rounded-xl bg-success/10 border border-success/20 p-4">
          <p className="text-sm text-success">Encaissé</p>
          <p className="text-2xl font-bold text-success">{(stats?.total_paid ?? 0).toLocaleString()} €</p>
        </div>
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
          <p className="text-sm text-warning">En attente</p>
          <p className="text-2xl font-bold text-warning">{(stats?.total_pending ?? 0).toLocaleString()} €</p>
        </div>
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">En retard</p>
          <p className="text-2xl font-bold text-destructive">{(stats?.total_overdue ?? 0).toLocaleString()} €</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue'].map((status) => (
              <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(status)}>
                {status === 'all' ? 'Tous' : statusConfig[status as PaymentStatus]?.label}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exporter</Button>
      </div>

      {isLoading && <LoadingState message="Chargement des paiements..." />}
      {isError && <ErrorState message="Impossible de charger les paiements." onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Locataire</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Bien</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Montant</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Échéance</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Paiement</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const config = statusConfig[payment.status] ?? statusConfig.pending;
                  const StatusIcon = config.icon;
                  
                  return (
                    <tr key={payment.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                            {payment.tenant_name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-foreground">{payment.tenant_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-foreground">{payment.property_name}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">{payment.amount} €</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(payment.due_date).toLocaleDateString('fr-FR')}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn('gap-1', config.className)}>
                          <StatusIcon className="h-3 w-3" />{config.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {payment.payment_date ? (
                          <div className="text-sm">
                            <p className="text-foreground">{new Date(payment.payment_date).toLocaleDateString('fr-FR')}</p>
                            <p className="text-muted-foreground">{payment.payment_method ? methodLabels[payment.payment_method] ?? payment.payment_method : ''}</p>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" disabled={recordPayment.isPending}
                            onClick={() => recordPayment.mutate({ id: payment.id, data: { payment_method: 'bank_transfer' } })}>
                            <CreditCard className="h-4 w-4 mr-2" />Enregistrer
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Payments;
