import { Building2, MapPin, Euro, Calendar, User, Phone, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TenantProperty = () => {
  const property = {
    name: 'Appartement T3 Lumineux',
    address: '15 Rue de Paris, 75001 Paris',
    type: 'Appartement',
    rent: 1200,
    dueDate: 5,
    nextPayment: '2024-02-05',
    surface: 65,
    rooms: 3,
    floor: 3,
    features: ['Balcon', 'Parking', 'Cave', 'Ascenseur'],
  };

  const agent = {
    name: 'Marie Dupont',
    email: 'marie.dupont@immogest.com',
    phone: '01 23 45 67 89',
  };

  const daysUntilDue = 12; // Mock value

  return (
    <DashboardLayout title="Mon logement" subtitle="Informations sur votre location">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Property Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Info */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Building2 className="h-20 w-20 text-primary/40" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{property.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    {property.address}
                  </div>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {property.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Surface</p>
                  <p className="text-lg font-semibold text-foreground">{property.surface} m²</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pièces</p>
                  <p className="text-lg font-semibold text-foreground">{property.rooms}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Étage</p>
                  <p className="text-lg font-semibold text-foreground">{property.floor}ème</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loyer</p>
                  <p className="text-lg font-semibold text-foreground">{property.rent} €/mois</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium text-foreground mb-2">Équipements</p>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agent Contact */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Votre agent</h3>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold text-lg">
                {agent.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{agent.name}</p>
                <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {agent.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {agent.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Prochain paiement</h3>
            
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
                <Euro className="h-10 w-10 text-primary" />
              </div>
              <p className="text-4xl font-bold text-foreground">{property.rent} €</p>
              <p className="text-muted-foreground">à payer avant le {property.dueDate} du mois</p>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Échéance
              </div>
              <span className="font-medium text-foreground">{property.nextPayment}</span>
            </div>

            <div className="flex items-center justify-between py-4 border-t border-border">
              <span className="text-muted-foreground">Jours restants</span>
              <Badge 
                variant="outline" 
                className={daysUntilDue <= 5 
                  ? 'bg-warning/10 text-warning border-warning/20' 
                  : 'bg-success/10 text-success border-success/20'
                }
              >
                {daysUntilDue} jours
              </Badge>
            </div>

            <Button variant="gradient" size="lg" className="w-full mt-4">
              Payer mon loyer
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Historique</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Paiements effectués</span>
                <span className="font-semibold text-success">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total versé</span>
                <span className="font-semibold text-foreground">14 400 €</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Depuis</span>
                <span className="font-semibold text-foreground">Mars 2023</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              Voir l'historique complet
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TenantProperty;
