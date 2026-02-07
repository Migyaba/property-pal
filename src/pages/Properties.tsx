import { useState } from 'react';
import { Plus, Search, Building2, MapPin, Euro, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { LoadingState, ErrorState } from '@/components/ui/LoadingState';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useProperties, useCreateProperty, useDeleteProperty } from '@/hooks/useProperties';
import type { Property, PropertyType } from '@/types/api';

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success border-success/20' },
  occupied: { label: 'Occupé', className: 'bg-primary/10 text-primary border-primary/20' },
  maintenance: { label: 'Maintenance', className: 'bg-warning/10 text-warning border-warning/20' },
};

const typeLabels: Record<string, string> = {
  apartment: 'Appartement',
  house: 'Maison',
  studio: 'Studio',
  commercial: 'Commercial',
  loft: 'Loft',
  parking: 'Parking',
  other: 'Autre',
};

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', postal_code: '',
    property_type: 'apartment' as PropertyType,
    surface: '', rooms: '', rent_amount: '', charges_amount: '', description: '',
  });

  const { data, isLoading, isError, refetch } = useProperties({ search: searchQuery || undefined });
  const createProperty = useCreateProperty();
  const deleteProperty = useDeleteProperty();

  const properties = data?.results ?? [];

  const handleCreate = () => {
    createProperty.mutate({
      name: formData.name,
      address: formData.address,
      city: formData.city,
      postal_code: formData.postal_code,
      property_type: formData.property_type,
      surface: Number(formData.surface),
      rooms: formData.rooms ? Number(formData.rooms) : undefined,
      rent_amount: Number(formData.rent_amount),
      charges_amount: formData.charges_amount ? Number(formData.charges_amount) : undefined,
      description: formData.description,
    }, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        setFormData({ name: '', address: '', city: '', postal_code: '', property_type: 'apartment', surface: '', rooms: '', rent_amount: '', charges_amount: '', description: '' });
      },
    });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout title="Gestion des biens" subtitle="Gérez vos propriétés immobilières">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un bien..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient"><Plus className="h-4 w-4" />Ajouter un bien</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau bien</DialogTitle>
              <DialogDescription>Remplissez les informations du bien immobilier.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du bien</Label>
                <Input id="name" placeholder="Ex: Appartement T3" value={formData.name} onChange={(e) => updateField('name', e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="15 Rue de Paris" value={formData.address} onChange={(e) => updateField('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" placeholder="Paris" value={formData.city} onChange={(e) => updateField('city', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input id="postal_code" placeholder="75001" value={formData.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type de bien</Label>
                  <select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.property_type} onChange={(e) => updateField('property_type', e.target.value)}>
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="studio">Studio</option>
                    <option value="commercial">Commercial</option>
                    <option value="loft">Loft</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rent">Loyer mensuel (€)</Label>
                  <Input id="rent" type="number" placeholder="1200" value={formData.rent_amount} onChange={(e) => updateField('rent_amount', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="surface">Surface (m²)</Label>
                  <Input id="surface" type="number" placeholder="65" value={formData.surface} onChange={(e) => updateField('surface', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rooms">Pièces</Label>
                  <Input id="rooms" type="number" placeholder="3" value={formData.rooms} onChange={(e) => updateField('rooms', e.target.value)} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
              <Button variant="gradient" onClick={handleCreate} disabled={createProperty.isPending}>
                {createProperty.isPending ? 'Création...' : 'Créer le bien'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <LoadingState message="Chargement des biens..." />}
      {isError && <ErrorState message="Impossible de charger les biens." onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} onDelete={(id) => deleteProperty.mutate(id)} />
            ))}
          </div>

          {properties.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucun bien trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier votre recherche.</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

const PropertyCard = ({ property, onDelete }: { property: Property; onDelete: (id: number) => void }) => {
  const status = statusConfig[property.status] ?? statusConfig.available;

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover-lift">
      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Building2 className="h-16 w-16 text-primary/40" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{property.name}</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {property.address}, {property.city}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(property.id)}>
                <Trash2 className="h-4 w-4 mr-2" />Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">{typeLabels[property.property_type] ?? property.property_type}</Badge>
          <Badge variant="outline" className={cn('text-xs', status.className)}>{status.label}</Badge>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-lg font-bold text-foreground">
            <Euro className="h-4 w-4" />
            {property.rent_amount}
            <span className="text-sm font-normal text-muted-foreground">/mois</span>
          </div>
          {property.surface && (
            <span className="text-sm text-muted-foreground">{property.surface} m²</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
