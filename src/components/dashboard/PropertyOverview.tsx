import { Building2, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LoadingState, ErrorState } from '@/components/ui/LoadingState';
import { useProperties } from '@/hooks/useProperties';

export const PropertyOverview = () => {
  const { data, isLoading, isError, refetch } = useProperties();
  const properties = data?.results ?? [];

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Aperçu des biens</h3>
        <a href="/properties" className="text-sm font-medium text-primary hover:underline">Gérer les biens</a>
      </div>

      {isLoading && <LoadingState message="Chargement..." />}
      {isError && <ErrorState message="Erreur de chargement." onRetry={() => refetch()} />}

      {!isLoading && !isError && properties.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Aucun bien enregistré</p>
      )}

      {!isLoading && !isError && properties.length > 0 && (
        <div className="space-y-4">
          {properties.slice(0, 4).map((property) => {
            const isOccupied = property.status === 'occupied';
            const occupancy = isOccupied ? 100 : 0;

            return (
              <div key={property.id} className="rounded-lg bg-secondary/30 p-4 transition-colors hover:bg-secondary/50">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{property.name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />{property.address}, {property.city}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">{property.rent_amount} €/mois</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Occupation</span>
                    <span className="font-medium text-foreground">{occupancy}%</span>
                  </div>
                  <Progress value={occupancy} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
