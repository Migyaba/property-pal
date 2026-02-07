import { Building2, Users, CreditCard, TrendingUp, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentPayments } from '@/components/dashboard/RecentPayments';
import { PropertyOverview } from '@/components/dashboard/PropertyOverview';
import { LoadingState, ErrorState } from '@/components/ui/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();
  
  const isAdmin = user?.role === 'admin';
  const greeting = `Bonjour, ${user?.firstName} !`;
  const subtitle = isAdmin 
    ? 'Vue d\'ensemble de la plateforme'
    : 'Voici un aperçu de votre activité';

  return (
    <DashboardLayout title={greeting} subtitle={subtitle}>
      {isLoading && <LoadingState message="Chargement du tableau de bord..." />}
      {isError && <ErrorState message="Impossible de charger les statistiques." onRetry={() => refetch()} />}

      {!isLoading && !isError && stats && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title={isAdmin ? "Total Biens" : "Mes biens"}
              value={String(stats.total_properties)}
              icon={<Building2 className="h-6 w-6" />}
              variant="primary"
            />
            <StatCard
              title={isAdmin ? "Total Locataires" : "Mes locataires"}
              value={String(stats.total_tenants)}
              icon={<Users className="h-6 w-6" />}
              variant="default"
            />
            <StatCard
              title="Loyers encaissés"
              value={`${stats.total_rent_collected.toLocaleString()} €`}
              icon={<CreditCard className="h-6 w-6" />}
              variant="success"
            />
            <StatCard
              title="Impayés"
              value={`${stats.total_overdue.toLocaleString()} €`}
              icon={<AlertTriangle className="h-6 w-6" />}
              variant="destructive"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentPayments payments={stats.recent_payments} />
            <PropertyOverview />
          </div>
        </>
      )}

      {/* Quick Actions for Agent */}
      {user?.role === 'agent' && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Actions rapides</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction title="Ajouter un bien" description="Créer une nouvelle propriété" href="/properties" icon={<Building2 className="h-5 w-5" />} />
            <QuickAction title="Nouveau locataire" description="Enregistrer un locataire" href="/tenants" icon={<Users className="h-5 w-5" />} />
            <QuickAction title="Enregistrer un paiement" description="Ajouter un paiement manuel" href="/payments" icon={<CreditCard className="h-5 w-5" />} />
            <QuickAction title="Voir les rapports" description="Statistiques détaillées" href="/statistics" icon={<TrendingUp className="h-5 w-5" />} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const QuickAction = ({ title, description, href, icon }: QuickActionProps) => (
  <a href={href} className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover-lift hover:border-primary/50">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
      {icon}
    </div>
    <div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </a>
);

export default Dashboard;
