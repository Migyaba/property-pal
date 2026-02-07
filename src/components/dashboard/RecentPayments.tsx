import { Check, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Payment } from '@/types/api';

const statusConfig = {
  paid: { label: 'Payé', icon: Check, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'En attente', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'En retard', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
  cancelled: { label: 'Annulé', icon: Clock, className: 'bg-muted text-muted-foreground border-border' },
};

interface RecentPaymentsProps {
  payments?: Payment[];
}

export const RecentPayments = ({ payments = [] }: RecentPaymentsProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Paiements récents</h3>
        <a href="/payments" className="text-sm font-medium text-primary hover:underline">Voir tout</a>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun paiement récent</p>
      ) : (
        <div className="space-y-4">
          {payments.slice(0, 5).map((payment) => {
            const config = statusConfig[payment.status] ?? statusConfig.pending;
            const StatusIcon = config.icon;
            
            return (
              <div key={payment.id} className="flex items-center justify-between rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                    {payment.tenant_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{payment.tenant_name}</p>
                    <p className="text-sm text-muted-foreground">{payment.property_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{payment.amount} €</p>
                    <p className="text-xs text-muted-foreground">{new Date(payment.due_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <Badge variant="outline" className={cn('gap-1', config.className)}>
                    <StatusIcon className="h-3 w-3" />{config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
