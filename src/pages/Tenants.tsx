import { useState } from 'react';
import { Plus, Search, User, Mail, Phone, Home, MoreVertical, Edit, Trash2, Key, Copy } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  property: string;
  rent: number;
  status: 'active' | 'pending' | 'inactive';
  moveInDate: string;
}

const mockTenants: Tenant[] = [
  { id: '1', firstName: 'Jean', lastName: 'Martin', email: 'jean.martin@email.com', phone: '06 12 34 56 78', property: 'Apt T3 - Rue de Paris', rent: 1200, status: 'active', moveInDate: '2023-03-15' },
  { id: '2', firstName: 'Marie', lastName: 'Leroy', email: 'marie.leroy@email.com', phone: '06 23 45 67 89', property: 'Studio - Avenue Victor Hugo', rent: 650, status: 'active', moveInDate: '2023-06-01' },
  { id: '3', firstName: 'Pierre', lastName: 'Dubois', email: 'pierre.dubois@email.com', phone: '06 34 56 78 90', property: 'T4 - Place de la Nation', rent: 1650, status: 'pending', moveInDate: '2024-02-01' },
  { id: '4', firstName: 'Sophie', lastName: 'Bernard', email: 'sophie.bernard@email.com', phone: '06 45 67 89 01', property: 'Maison - Rue des Fleurs', rent: 2100, status: 'active', moveInDate: '2022-09-01' },
  { id: '5', firstName: 'Lucas', lastName: 'Moreau', email: 'lucas.moreau@email.com', phone: '06 56 78 90 12', property: 'T2 - Boulevard Haussmann', rent: 950, status: 'inactive', moveInDate: '2021-01-15' },
];

const statusConfig = {
  active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
  pending: { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
  inactive: { label: 'Inactif', className: 'bg-muted text-muted-foreground border-border' },
};

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const { toast } = useToast();

  const filteredTenants = mockTenants.filter(
    (t) =>
      t.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTenant = () => {
    setShowCredentials(true);
  };

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText('Email: nouveau.locataire@email.com\nMot de passe: TempPass123!');
    toast({
      title: 'Identifiants copiés',
      description: 'Les identifiants ont été copiés dans le presse-papier.',
    });
  };

  return (
    <DashboardLayout title="Gestion des locataires" subtitle="Gérez vos locataires et leurs contrats">
      {/* Header Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un locataire..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setShowCredentials(false);
        }}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus className="h-4 w-4" />
              Nouveau locataire
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {!showCredentials ? (
              <>
                <DialogHeader>
                  <DialogTitle>Créer un compte locataire</DialogTitle>
                  <DialogDescription>
                    Les identifiants de connexion seront générés automatiquement.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Jean" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Martin" />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jean.martin@email.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="06 12 34 56 78" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="property">Bien assigné</Label>
                    <select id="property" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Sélectionner un bien</option>
                      <option value="1">Apt T3 - Rue de Paris (1200€)</option>
                      <option value="2">Studio - Avenue Victor Hugo (650€)</option>
                      <option value="3">T2 - Boulevard Haussmann (950€)</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button variant="gradient" onClick={handleCreateTenant}>
                    Créer le compte
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-success" />
                    Compte créé avec succès
                  </DialogTitle>
                  <DialogDescription>
                    Voici les identifiants de connexion du locataire.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground">nouveau.locataire@email.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mot de passe</span>
                      <span className="font-mono font-medium text-foreground">TempPass123!</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={handleCopyCredentials}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier les identifiants
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="gradient" onClick={() => {
                    setIsAddDialogOpen(false);
                    setShowCredentials(false);
                  }}>
                    Terminé
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Tenants Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Locataire</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Bien</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Loyer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Statut</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenants.map((tenant) => {
                const status = statusConfig[tenant.status];
                return (
                  <tr key={tenant.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                          {tenant.firstName[0]}{tenant.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{tenant.firstName} {tenant.lastName}</p>
                          <p className="text-sm text-muted-foreground">Depuis {tenant.moveInDate}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {tenant.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {tenant.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        {tenant.property}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">{tenant.rent} €</span>
                      <span className="text-sm text-muted-foreground">/mois</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={status.className}>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
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
                          <DropdownMenuItem>
                            <Key className="h-4 w-4 mr-2" />
                            Réinitialiser le mot de passe
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTenants.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground">Aucun locataire trouvé</h3>
          <p className="text-muted-foreground">Essayez de modifier votre recherche.</p>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Tenants;
