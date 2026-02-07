import { useState } from 'react';
import { User, Bell, Lock, Palette } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Profile state
  const [profileData, setProfileData] = useState({
    first_name: user?.firstName ?? '',
    last_name: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password state
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await authService.updateProfile(profileData);
      await refreshUser();
      toast({ title: 'Profil mis à jour', description: 'Vos informations ont été sauvegardées.' });
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le profil.', variant: 'destructive' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast({ title: 'Erreur', description: 'Le mot de passe doit contenir au moins 8 caractères.', variant: 'destructive' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast({ title: 'Mot de passe modifié', description: 'Votre mot de passe a été changé avec succès.' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch {
      toast({ title: 'Erreur', description: 'Mot de passe actuel incorrect ou erreur serveur.', variant: 'destructive' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez vos préférences">
      <div className="max-w-3xl space-y-8">
        {/* Profile Section */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profil</h2>
              <p className="text-sm text-muted-foreground">Vos informations personnelles</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" value={profileData.first_name} onChange={(e) => setProfileData(p => ({ ...p, first_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" value={profileData.last_name} onChange={(e) => setProfileData(p => ({ ...p, last_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="gradient" onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Apparence</h2>
              <p className="text-sm text-muted-foreground">Personnalisez l'interface</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Thème sombre</p>
                <p className="text-sm text-muted-foreground">Activer le mode sombre</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} />
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Gérez vos alertes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Notifications par email</p>
                <p className="text-sm text-muted-foreground">Recevoir les alertes par email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Rappels de paiement</p>
                <p className="text-sm text-muted-foreground">Notification avant échéance</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium text-foreground">Nouveaux locataires</p>
                <p className="text-sm text-muted-foreground">Alertes de nouvelles inscriptions</p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Sécurité</h2>
              <p className="text-sm text-muted-foreground">Protégez votre compte</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" type="password" value={passwordData.old_password} onChange={(e) => setPasswordData(p => ({ ...p, old_password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" value={passwordData.new_password} onChange={(e) => setPasswordData(p => ({ ...p, new_password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData(p => ({ ...p, confirm_password: e.target.value }))} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
