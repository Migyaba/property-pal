import { Download, Check, FileText, Euro } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  month: string;
  amount: number;
  status: 'paid';
  paidDate: string;
  method: string;
  receiptAvailable: boolean;
}

const mockPayments: Payment[] = [
  { id: '1', month: 'Janvier 2024', amount: 1200, status: 'paid', paidDate: '2024-01-03', method: 'Virement', receiptAvailable: true },
  { id: '2', month: 'Décembre 2023', amount: 1200, status: 'paid', paidDate: '2023-12-05', method: 'Virement', receiptAvailable: true },
  { id: '3', month: 'Novembre 2023', amount: 1200, status: 'paid', paidDate: '2023-11-04', method: 'Carte bancaire', receiptAvailable: true },
  { id: '4', month: 'Octobre 2023', amount: 1200, status: 'paid', paidDate: '2023-10-03', method: 'Virement', receiptAvailable: true },
  { id: '5', month: 'Septembre 2023', amount: 1200, status: 'paid', paidDate: '2023-09-05', method: 'Virement', receiptAvailable: true },
  { id: '6', month: 'Août 2023', amount: 1200, status: 'paid', paidDate: '2023-08-04', method: 'Carte bancaire', receiptAvailable: true },
  { id: '7', month: 'Juillet 2023', amount: 1200, status: 'paid', paidDate: '2023-07-05', method: 'Virement', receiptAvailable: true },
  { id: '8', month: 'Juin 2023', amount: 1200, status: 'paid', paidDate: '2023-06-03', method: 'Virement', receiptAvailable: true },
];

const TenantPayments = () => {
  const totalPaid = mockPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <DashboardLayout title="Mes paiements" subtitle="Historique de vos paiements de loyer">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paiements effectués</p>
              <p className="text-2xl font-bold text-foreground">{mockPayments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Euro className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total versé</p>
              <p className="text-2xl font-bold text-foreground">{totalPaid.toLocaleString()} €</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reçus disponibles</p>
              <p className="text-2xl font-bold text-foreground">{mockPayments.filter(p => p.receiptAvailable).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Historique des paiements</h3>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Tout télécharger
          </Button>
        </div>

        <div className="divide-y divide-border">
          {mockPayments.map((payment) => (
            <div
              key={payment.id}
              className="p-6 flex items-center justify-between hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{payment.month}</p>
                  <p className="text-sm text-muted-foreground">
                    Payé le {payment.paidDate} • {payment.method}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{payment.amount} €</p>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    Payé
                  </Badge>
                </div>
                
                {payment.receiptAvailable && (
                  <Button variant="ghost" size="icon">
                    <Download className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TenantPayments;
