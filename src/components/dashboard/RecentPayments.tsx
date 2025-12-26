import { Check, Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  tenant: string;
  property: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  date: string;
}

const mockPayments: Payment[] = [
  { id: '1', tenant: 'Jean Martin', property: 'Apt 12B - Rue de Paris', amount: 850, status: 'paid', date: '2024-01-15' },
  { id: '2', tenant: 'Marie Leroy', property: 'Studio 3 - Avenue Victor Hugo', amount: 650, status: 'pending', date: '2024-01-14' },
  { id: '3', tenant: 'Pierre Dubois', property: 'T3 - Boulevard Haussmann', amount: 1200, status: 'overdue', date: '2024-01-10' },
  { id: '4', tenant: 'Sophie Bernard', property: 'Apt 8A - Rue du Commerce', amount: 950, status: 'paid', date: '2024-01-12' },
  { id: '5', tenant: 'Lucas Moreau', property: 'T2 - Place de la Nation', amount: 780, status: 'paid', date: '2024-01-11' },
];

const statusConfig = {
  paid: {
    label: 'Payé',
    icon: Check,
    className: 'bg-success/10 text-success border-success/20',
  },
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  overdue: {
    label: 'En retard',
    icon: AlertTriangle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

export const RecentPayments = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Paiements récents</h3>
        <a href="/payments" className="text-sm font-medium text-primary hover:underline">
          Voir tout
        </a>
      </div>

      <div className="space-y-4">
        {mockPayments.map((payment) => {
          const config = statusConfig[payment.status];
          const StatusIcon = config.icon;
          
          return (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  {payment.tenant.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-foreground">{payment.tenant}</p>
                  <p className="text-sm text-muted-foreground">{payment.property}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{payment.amount} €</p>
                  <p className="text-xs text-muted-foreground">{payment.date}</p>
                </div>
                <Badge variant="outline" className={cn('gap-1', config.className)}>
                  <StatusIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
