import { useState } from 'react';
import { Plus, Search, Building2, MapPin, Euro, Users, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  name: string;
  address: string;
  type: 'apartment' | 'house' | 'studio' | 'commercial';
  rent: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenant?: string;
  image?: string;
}

const mockProperties: Property[] = [
  { id: '1', name: 'Appartement T3 Lumineux', address: '15 Rue de Paris, 75001 Paris', type: 'apartment', rent: 1200, status: 'occupied', tenant: 'Jean Martin' },
  { id: '2', name: 'Studio Centre-Ville', address: '42 Avenue Victor Hugo, 75016 Paris', type: 'studio', rent: 650, status: 'available' },
  { id: '3', name: 'Maison avec Jardin', address: '8 Rue des Fleurs, 92100 Boulogne', type: 'house', rent: 2100, status: 'occupied', tenant: 'Sophie Bernard' },
  { id: '4', name: 'T2 Rénové', address: '23 Boulevard Haussmann, 75009 Paris', type: 'apartment', rent: 950, status: 'maintenance' },
  { id: '5', name: 'Local Commercial', address: '56 Rue du Commerce, 75015 Paris', type: 'commercial', rent: 1800, status: 'available' },
  { id: '6', name: 'Appartement T4 Familial', address: '12 Place de la Nation, 75011 Paris', type: 'apartment', rent: 1650, status: 'occupied', tenant: 'Pierre Dubois' },
];

const statusConfig = {
  available: { label: 'Disponible', className: 'bg-success/10 text-success border-success/20' },
  occupied: { label: 'Occupé', className: 'bg-primary/10 text-primary border-primary/20' },
  maintenance: { label: 'Maintenance', className: 'bg-warning/10 text-warning border-warning/20' },
};

const typeLabels = {
  apartment: 'Appartement',
  house: 'Maison',
  studio: 'Studio',
  commercial: 'Commercial',
};

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProperties = mockProperties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Gestion des biens" subtitle="Gérez vos propriétés immobilières">
      {/* Header Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un bien..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              Ajouter un bien
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau bien</DialogTitle>
              <DialogDescription>
                Remplissez les informations du bien immobilier.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du bien</Label>
                <Input id="name" placeholder="Ex: Appartement T3 Lumineux" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="15 Rue de Paris, 75001 Paris" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Type de bien</Label>
                  <select id="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="apartment">Appartement</option>
                    <option value="house">Maison</option>
                    <option value="studio">Studio</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rent">Loyer mensuel (€)</Label>
                  <Input id="rent" type="number" placeholder="1200" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button variant="gradient" onClick={() => setIsAddDialogOpen(false)}>
                Créer le bien
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucun bien trouvé</h3>
          <p className="text-muted-foreground">Essayez de modifier votre recherche.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

const PropertyCard = ({ property }: { property: Property }) => {
  const status = statusConfig[property.status];

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover-lift">
      {/* Property Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Building2 className="h-16 w-16 text-primary/40" />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {property.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {property.address}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge variant="outline" className="text-xs">
            {typeLabels[property.type]}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', status.className)}>
            {status.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-lg font-bold text-foreground">
            <Euro className="h-4 w-4" />
            {property.rent}
            <span className="text-sm font-normal text-muted-foreground">/mois</span>
          </div>
          
          {property.tenant && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {property.tenant}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
