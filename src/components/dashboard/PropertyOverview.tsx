import { Building2, Users, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Property {
  id: string;
  name: string;
  address: string;
  tenants: number;
  maxTenants: number;
  occupancy: number;
}

const mockProperties: Property[] = [
  { id: '1', name: 'Résidence Les Jardins', address: '15 Rue de Paris, 75001', tenants: 8, maxTenants: 10, occupancy: 80 },
  { id: '2', name: 'Immeuble Victor Hugo', address: '42 Avenue Victor Hugo, 75016', tenants: 12, maxTenants: 12, occupancy: 100 },
  { id: '3', name: 'Le Clos Montmartre', address: '8 Rue Lepic, 75018', tenants: 5, maxTenants: 8, occupancy: 62 },
  { id: '4', name: 'Bastille Apartments', address: '23 Place de la Bastille, 75011', tenants: 6, maxTenants: 6, occupancy: 100 },
];

export const PropertyOverview = () => {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Aperçu des biens</h3>
        <a href="/properties" className="text-sm font-medium text-primary hover:underline">
          Gérer les biens
        </a>
      </div>

      <div className="space-y-4">
        {mockProperties.map((property) => (
          <div
            key={property.id}
            className="rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50"
          >
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{property.name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {property.address}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {property.tenants}/{property.maxTenants}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Occupation</span>
                <span className="font-medium text-foreground">{property.occupancy}%</span>
              </div>
              <Progress value={property.occupancy} className="h-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
