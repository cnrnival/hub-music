/**
 * Hub Music - Settings Page
 * Página de configurações: perfil, preferências e conta do usuário
 * Settings page: profile, preferences and user account settings
 * 
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, Bell, Moon, Save, AlertCircle, CheckCircle, Trash2, Key } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'account', label: 'Conta', icon: Key },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'appearance', label: 'Aparência', icon: Moon },
  { id: 'danger', label: 'Perigo', icon: Trash2 }
];

export function Settings() {
  const { user, updateUser, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    email: user?.email || ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    emailLikes: true,
    emailReposts: true,
    emailComments: true,
    emailFollows: true,
    emailNewsletter: false,
    pushLikes: true,
    pushReposts: true,
    pushComments: true,
    pushFollows: true
  });

  // Appearance
  const [appearance, setAppearance] = useState({
    theme: 'system',
    compactMode: false,
    autoPlay: true,
    showWaveform: true
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await updateUser(profileData);
      await refreshUser();
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.axios.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Senha alterada com sucesso!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.axios.patch('/auth/notifications', notifications);
      setSuccess('Preferências salvas!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // Save to localStorage for now
      localStorage.setItem('appearance', JSON.stringify(appearance));
      setSuccess('Preferências salvas!');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Tem certeza? Esta ação é irreversível e todos os seus dados serão excluídos permanentemente.')) {
      return;
    }
    if (!window.confirm('Última confirmação: sua conta, faixas, playlists e seguidores serão removidos para sempre.')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await api.axios.delete('/auth/account');
      // Logout handled by auth context
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-display-sm font-bold gradient-text">Configurações</h1>
        <p className="text-text-secondary mt-1">Gerencie sua conta e preferências</p>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <nav className="flex gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(null); setSuccess(null); }}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
              )}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </Card>

      {/* Tab Content */}
      <Card className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl text-error">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-xl text-success">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-heading-sm font-bold">Perfil público</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.avatarUrl}
                name={user?.displayName}
                size="2xl"
              />
              <div>
                <p className="font-medium text-text-primary">{user?.displayName}</p>
                <p className="text-text-secondary text-sm">@{user?.username}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  Alterar avatar
                </Button>
              </div>
            </div>

            <Input
              label="Nome de exibição"
              value={profileData.displayName}
              onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
              placeholder="Seu nome"
            />

            <Textarea
              label="Bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Conte sobre você..."
              rows={3}
              helperText="Máximo 160 caracteres"
            />

            <Input
              label="Email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              type="email"
              disabled
              helperText="Para alterar o email, vá na aba Conta"
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <h2 className="text-heading-sm font-bold">Segurança da conta</h2>

            <div className="space-y-4">
              <h3 className="text-heading-sm font-medium">Alterar senha</h3>

              <Input
                label="Senha atual"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <Input
                label="Nova senha"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
                helperText="Mínimo 8 caracteres"
              />

              <Input
                label="Confirmar nova senha"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <Button onClick={handleSavePassword} disabled={saving}>
                <Key className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Alterar senha'}
              </Button>
            </div>

            <div className="pt-6 border-t border-border/50">
              <h3 className="text-heading-sm font-medium">Sessões ativas</h3>
              <p className="text-text-secondary text-sm">Gerencie seus logins ativos em outros dispositivos</p>
              <Button variant="secondary" className="mt-3">Ver sessões</Button>
            </div>

            <div className="pt-6 border-t border-border/50">
              <h3 className="text-heading-sm font-medium">Autenticação de dois fatores</h3>
              <p className="text-text-secondary text-sm">Adicione uma camada extra de segurança à sua conta</p>
              <Button variant="secondary" className="mt-3">Ativar 2FA</Button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-heading-sm font-bold">Preferências de notificação</h2>

            <NotificationSection title="Email" description="Receba notificações por email">
              <NotificationToggle
                label="Novas curtidas nas suas faixas"
                checked={notifications.emailLikes}
                onChange={(checked) => setNotifications({ ...notifications, emailLikes: checked })}
              />
              <NotificationToggle
                label="Novos reposts das suas faixas"
                checked={notifications.emailReposts}
                onChange={(checked) => setNotifications({ ...notifications, emailReposts: checked })}
              />
              <NotificationToggle
                label="Novos comentários"
                checked={notifications.emailComments}
                onChange={(checked) => setNotifications({ ...notifications, emailComments: checked })}
              />
              <NotificationToggle
                label="Novos seguidores"
                checked={notifications.emailFollows}
                onChange={(checked) => setNotifications({ ...notifications, emailFollows: checked })}
              />
              <NotificationToggle
                label="Newsletter semanal"
                checked={notifications.emailNewsletter}
                onChange={(checked) => setNotifications({ ...notifications, emailNewsletter: checked })}
              />
            </NotificationSection>

            <NotificationSection title="Push (navegador)" description="Notificações em tempo real">
              <NotificationToggle
                label="Curtidas"
                checked={notifications.pushLikes}
                onChange={(checked) => setNotifications({ ...notifications, pushLikes: checked })}
              />
              <NotificationToggle
                label="Reposts"
                checked={notifications.pushReposts}
                onChange={(checked) => setNotifications({ ...notifications, pushReposts: checked })}
              />
              <NotificationToggle
                label="Comentários"
                checked={notifications.pushComments}
                onChange={(checked) => setNotifications({ ...notifications, pushComments: checked })}
              />
              <NotificationToggle
                label="Seguidores"
                checked={notifications.pushFollows}
                onChange={(checked) => setNotifications({ ...notifications, pushFollows: checked })}
              />
            </NotificationSection>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveNotifications} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar preferências'}
              </Button>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-heading-sm font-bold">Aparência e reprodução</h2>

            <div className="space-y-4">
              <h3 className="text-heading-sm font-medium">Tema</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'dark', label: 'Escuro', icon: Moon },
                  { value: 'light', label: 'Claro', icon: Sun },
                  { value: 'system', label: 'Sistema', icon: Monitor }
                ].map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setAppearance({ ...appearance, theme: theme.value })}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-all',
                      appearance.theme === theme.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-border-light'
                    )}
                  >
                    <theme.icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-heading-sm font-medium">Reprodução</h3>
              <SettingToggle
                label="Reprodução automática"
                description="Iniciar reprodução automaticamente ao abrir uma faixa"
                checked={appearance.autoPlay}
                onChange={(checked) => setAppearance({ ...appearance, autoPlay: checked })}
              />
              <SettingToggle
                label="Mostrar waveform"
                description="Exibir visualização da forma de onda no player"
                checked={appearance.showWaveform}
                onChange={(checked) => setAppearance({ ...appearance, showWaveform: checked })}
              />
              <SettingToggle
                label="Modo compacto"
                description="Interface mais densa para telas menores"
                checked={appearance.compactMode}
                onChange={(checked) => setAppearance({ ...appearance, compactMode: checked })}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveAppearance} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar preferências'}
              </Button>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6 border-t border-error/20 pt-6">
            <div className="flex items-start gap-4 p-4 bg-error/5 rounded-xl">
              <AlertCircle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-heading-sm font-bold text-error">Zona de perigo</h3>
                <p className="text-text-secondary mt-1">
                  Estas ações são irreversíveis. Use com cuidado.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl">
                <div>
                  <p className="font-medium text-text-primary">Exportar seus dados</p>
                  <p className="text-text-secondary text-sm">Baixe uma cópia de todas as suas faixas, playlists e dados</p>
                </div>
                <Button variant="secondary">Exportar</Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-background-tertiary rounded-xl border border-error/20">
                <div>
                  <p className="font-medium text-error">Excluir conta permanentemente</p>
                  <p className="text-text-secondary text-sm">Remova sua conta, faixas, playlists e todos os dados associados</p>
                </div>
                <Button variant="danger" onClick={handleDeleteAccount} disabled={saving}>
                  {saving ? 'Excluindo...' : 'Excluir conta'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function NotificationSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 pt-4 border-t border-border/50">
      <div>
        <h3 className="text-heading-sm font-medium">{title}</h3>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NotificationToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-background-tertiary transition-colors">
      <span className="text-text-primary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-background-tertiary'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </label>
  );
}

function SettingToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl hover:bg-background-tertiary transition-colors">
      <div>
        <p className="font-medium text-text-primary">{label}</p>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-background-tertiary'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </label>
  );
}

import { Textarea } from '../components/ui/input';
import { Sun, Monitor } from 'lucide-react';