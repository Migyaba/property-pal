import { useState } from 'react';
import { Search, Filter, Check, Clock, AlertTriangle, Download, CreditCard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  tenant: string;
  property: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  paidDate?: string;
  method?: string;
}

const mockPayments: Payment[] = [
  { id: '1', tenant: 'Jean Martin', property: 'Apt T3 - Rue de Paris', amount: 1200, status: 'paid', dueDate: '2024-01-05', paidDate: '2024-01-03', method: 'Virement' },
  { id: '2', tenant: 'Marie Leroy', property: 'Studio - Avenue Victor Hugo', amount: 650, status: 'paid', dueDate: '2024-01-05', paidDate: '2024-01-05', method: 'Carte' },
  { id: '3', tenant: 'Pierre Dubois', property: 'T4 - Place de la Nation', amount: 1650, status: 'pending', dueDate: '2024-01-10' },
  { id: '4', tenant: 'Sophie Bernard', property: 'Maison - Rue des Fleurs', amount: 2100, status: 'overdue', dueDate: '2024-01-01' },
  { id: '5', tenant: 'Lucas Moreau', property: 'T2 - Boulevard Haussmann', amount: 950, status: 'paid', dueDate: '2024-01-05', paidDate: '2024-01-04', method: 'Virement' },
  { id: '6', tenant: 'Emma Petit', property: 'Studio - Rue du Bac', amount: 750, status: 'pending', dueDate: '2024-01-15' },
  { id: '7', tenant: 'Hugo Blanc', property: 'T3 - Avenue Foch', amount: 1400, status: 'overdue', dueDate: '2023-12-28' },
  { id: '8', tenant: 'Léa Rousseau', property: 'Apt - Rue de Rivoli', amount: 1100, status: 'paid', dueDate: '2024-01-05', paidDate: '2024-01-02', method: 'Virement' },
];

const statusConfig = {
  paid: { label: 'Payé', icon: Check, className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'En attente', icon: Clock, className: 'bg-warning/10 text-warning border-warning/20' },
  overdue: { label: 'En retard', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredPayments = mockPayments.filter((p) => {
    const matchesSearch =
      p.tenant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.property.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockPayments.reduce((acc, p) => acc + p.amount, 0),
    paid: mockPayments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0),
    pending: mockPayments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0),
    overdue: mockPayments.filter(p => p.status === 'overdue').reduce((acc, p) => acc + p.amount, 0),
  };

  return (
    <DashboardLayout title="Suivi des paiements" subtitle="Gérez les loyers et suivez les paiements">
      {/* Stats Summary */}
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <div className="rounded-xl bg-card border border-border p-4">
          <p className="text-sm text-muted-foreground">Total attendu</p>
          <p className="text-2xl font-bold text-foreground">{stats.total.toLocaleString()} €</p>
        </div>
        <div className="rounded-xl bg-success/10 border border-success/20 p-4">
          <p className="text-sm text-success">Encaissé</p>
          <p className="text-2xl font-bold text-success">{stats.paid.toLocaleString()} €</p>
        </div>
        <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
          <p className="text-sm text-warning">En attente</p>
          <p className="text-2xl font-bold text-warning">{stats.pending.toLocaleString()} €</p>
        </div>
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">En retard</p>
          <p className="text-2xl font-bold text-destructive">{stats.overdue.toLocaleString()} €</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'paid', 'pending', 'overdue'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'Tous' : statusConfig[status as keyof typeof statusConfig].label}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter
        </Button>
      </div>

      {/* Payments Table */}
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
                const status = statusConfig[payment.status];
                const StatusIcon = status.icon;
                
                return (
                  <tr key={payment.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {payment.tenant.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-foreground">{payment.tenant}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{payment.property}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{payment.amount} €</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{payment.dueDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn('gap-1', status.className)}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {payment.paidDate ? (
                        <div className="text-sm">
                          <p className="text-foreground">{payment.paidDate}</p>
                          <p className="text-muted-foreground">{payment.method}</p>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Enregistrer
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
    </DashboardLayout>
  );
};

export default Payments;
