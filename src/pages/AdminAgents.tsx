import { useState } from 'react';
import { Plus, Search, User, Mail, Phone, Building2, MoreVertical, Edit, Trash2 } from 'lucide-react';
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

interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  properties: number;
  tenants: number;
  status: 'active' | 'inactive';
  joinDate: string;
}

const mockAgents: Agent[] = [
  { id: '1', firstName: 'Marie', lastName: 'Dupont', email: 'marie.dupont@immogest.com', phone: '01 23 45 67 89', properties: 12, tenants: 28, status: 'active', joinDate: '2022-03-15' },
  { id: '2', firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@immogest.com', phone: '01 34 56 78 90', properties: 8, tenants: 15, status: 'active', joinDate: '2022-06-01' },
  { id: '3', firstName: 'Claire', lastName: 'Martin', email: 'claire.martin@immogest.com', phone: '01 45 67 89 01', properties: 15, tenants: 35, status: 'active', joinDate: '2021-09-01' },
  { id: '4', firstName: 'Nicolas', lastName: 'Petit', email: 'nicolas.petit@immogest.com', phone: '01 56 78 90 12', properties: 5, tenants: 10, status: 'inactive', joinDate: '2023-01-15' },
];

const statusConfig = {
  active: { label: 'Actif', className: 'bg-success/10 text-success border-success/20' },
  inactive: { label: 'Inactif', className: 'bg-muted text-muted-foreground border-border' },
};

const AdminAgents = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = mockAgents.filter(
    (a) =>
      a.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProperties = mockAgents.reduce((acc, a) => acc + a.properties, 0);
  const totalTenants = mockAgents.reduce((acc, a) => acc + a.tenants, 0);

  return (
    <DashboardLayout title="Gestion des agents" subtitle="Administrez les agents immobiliers">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total agents</p>
          <p className="text-3xl font-bold text-foreground">{mockAgents.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Biens gérés</p>
          <p className="text-3xl font-bold text-foreground">{totalProperties}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Locataires</p>
          <p className="text-3xl font-bold text-foreground">{totalTenants}</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="gradient">
          <Plus className="h-4 w-4" />
          Ajouter un agent
        </Button>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => {
          const status = statusConfig[agent.status];
          return (
            <div
              key={agent.id}
              className="rounded-xl border border-border bg-card p-6 transition-all hover-lift"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-primary-foreground font-bold">
                    {agent.firstName[0]}{agent.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{agent.firstName} {agent.lastName}</p>
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
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

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {agent.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {agent.phone}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{agent.properties}</span>
                  <span className="text-muted-foreground">biens</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{agent.tenants}</span>
                  <span className="text-muted-foreground">locataires</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default AdminAgents;
