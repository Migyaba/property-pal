import { useState } from 'react';
import { Plus, Search, User, Mail, Phone, Home, MoreVertical, Edit, Trash2, Key, Copy } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { useTenants, useCreateTenant, useTenantAssignments } from '@/hooks/useTenants';
import { useProperties } from '@/hooks/useProperties';
import type { CreateTenantResponse } from '@/types/api';

const Tenants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<CreateTenantResponse | null>(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    property_id: '', start_date: '', rent_amount: '', deposit_amount: '',
  });
  const { toast } = useToast();

  const { data: tenantsData, isLoading, isError, refetch } = useTenants({ search: searchQuery || undefined });
  const { data: assignmentsData } = useTenantAssignments({ is_active: true });
  const { data: propertiesData } = useProperties();
  const createTenant = useCreateTenant();

  const tenants = tenantsData?.results ?? [];
  const assignments = assignmentsData?.results ?? [];
  const availableProperties = (propertiesData?.results ?? []).filter(p => p.status === 'available');

  const getAssignmentForTenant = (tenantId: number) => {
    return assignments.find(a => a.tenant === tenantId && a.is_active);
  };

  const handleCreate = () => {
    createTenant.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || undefined,
      property_id: formData.property_id ? Number(formData.property_id) : undefined,
      start_date: formData.start_date || undefined,
      rent_amount: formData.rent_amount ? Number(formData.rent_amount) : undefined,
      deposit_amount: formData.deposit_amount ? Number(formData.deposit_amount) : undefined,
    }, {
      onSuccess: (data) => {
        setCredentials(data);
      },
    });
  };

  const handleCopyCredentials = () => {
    if (credentials) {
      navigator.clipboard.writeText(`Email: ${credentials.user.email}\nMot de passe: ${credentials.password}`);
      toast({ title: 'Identifiants copiés', description: 'Les identifiants ont été copiés dans le presse-papier.' });
    }
  };

  const closeDialog = () => {
    setIsAddDialogOpen(false);
    setCredentials(null);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', property_id: '', start_date: '', rent_amount: '', deposit_amount: '' });
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout title="Gestion des locataires" subtitle="Gérez vos locataires et leurs contrats">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un locataire..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setIsAddDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button variant="gradient"><Plus className="h-4 w-4" />Nouveau locataire</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {!credentials ? (
              <>
                <DialogHeader>
                  <DialogTitle>Créer un compte locataire</DialogTitle>
                  <DialogDescription>Les identifiants de connexion seront générés automatiquement.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input id="firstName" placeholder="Jean" value={formData.first_name} onChange={(e) => updateField('first_name', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input id="lastName" placeholder="Martin" value={formData.last_name} onChange={(e) => updateField('last_name', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="jean.martin@email.com" value={formData.email} onChange={(e) => updateField('email', e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="06 12 34 56 78" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="property">Bien assigné (optionnel)</Label>
                    <select id="property" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.property_id} onChange={(e) => updateField('property_id', e.target.value)}>
                      <option value="">Sélectionner un bien</option>
                      {availableProperties.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.city} ({p.rent_amount}€)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={closeDialog}>Annuler</Button>
                  <Button variant="gradient" onClick={handleCreate} disabled={createTenant.isPending}>
                    {createTenant.isPending ? 'Création...' : 'Créer le compte'}
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-success" />Compte créé avec succès
                  </DialogTitle>
                  <DialogDescription>Voici les identifiants de connexion du locataire.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Email</span>
                      <span className="font-medium text-foreground">{credentials.user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mot de passe</span>
                      <span className="font-mono font-medium text-foreground">{credentials.password}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" onClick={handleCopyCredentials}>
                    <Copy className="h-4 w-4 mr-2" />Copier les identifiants
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="gradient" onClick={closeDialog}>Terminé</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <LoadingState message="Chargement des locataires..." />}
      {isError && <ErrorState message="Impossible de charger les locataires." onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <>
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
                  {tenants.map((tenant) => {
                    const assignment = getAssignmentForTenant(tenant.id);
                    const isActive = tenant.is_active;
                    return (
                      <tr key={tenant.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                              {tenant.first_name[0]}{tenant.last_name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{tenant.first_name} {tenant.last_name}</p>
                              <p className="text-sm text-muted-foreground">Depuis {new Date(tenant.date_joined).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <Mail className="h-4 w-4 text-muted-foreground" />{tenant.email}
                            </div>
                            {tenant.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-4 w-4" />{tenant.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {assignment ? (
                            <div className="flex items-center gap-2 text-sm text-foreground">
                              <Home className="h-4 w-4 text-muted-foreground" />{assignment.property_name}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Non assigné</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {assignment ? (
                            <>
                              <span className="font-semibold text-foreground">{assignment.rent_amount} €</span>
                              <span className="text-sm text-muted-foreground">/mois</span>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={isActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
                            {isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit className="h-4 w-4 mr-2" />Modifier</DropdownMenuItem>
                              <DropdownMenuItem><Key className="h-4 w-4 mr-2" />Réinitialiser le mot de passe</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" />Supprimer</DropdownMenuItem>
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

          {tenants.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">Aucun locataire trouvé</h3>
              <p className="text-muted-foreground">Essayez de modifier votre recherche.</p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default Tenants;
