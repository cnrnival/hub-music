/**
 * Hub Music - SettingsPage
 * Página de configurações do usuário
 * User settings page
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Bell, Shield, Palette, Music, HardDrive, LogOut,
  Mail, Lock, Key, Eye, EyeOff, Camera, Image, Trash2,
  Save, Loader2, Check, AlertCircle, Info
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { Avatar } from '../../ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../../ui/dialog';
import { Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction } from '../../ui/toast';
import { useAuth } from '../../../hooks/auth/useAuth';
import { useUpdateProfile, useChangePassword, useDeleteAccount, useUploadAvatar, useUploadCover } from '../../../hooks/data/useProfile';
import { cn } from '../../../lib/utils';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, updateProfile: updateAuthProfile, logout } = useAuth();

  // Local state
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'privacy' | 'appearance' | 'storage' | 'danger'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(user?.coverUrl || null);

  // Account form state
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    likes: true,
    comments: true,
    follows: true,
    reposts: true,
    mentions: true,
    newReleases: true,
    weeklyDigest: false,
    marketing: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public' as 'public' | 'followers' | 'private',
    showListeningActivity: true,
    showFollows: true,
    showPlaylists: true,
    allowMessages: 'everyone' as 'everyone' | 'followers' | 'none',
    allowMentions: 'everyone' as 'everyone' | 'followers' | 'none',
    showEmail: false,
    showLocation: false,
  });

  // Appearance settings
  const [appearance, setAppearance] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    accentColor: '#FF4081',
    compactMode: false,
    animations: true,
    autoPlay: true,
    crossfade: true,
    crossfadeDuration: 5,
    equalizer: false,
    normalizeVolume: true,
  });

  // Mutations
  const { mutate: updateProfile } = useUpdateProfile();
  const { mutate: changePassword } = useChangePassword();
  const { mutate: deleteAccount } = useDeleteAccount();
  const { mutate: uploadAvatar } = useUploadAvatar();
  const { mutate: uploadCover } = useUploadCover();

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('O avatar deve ter no máximo 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('O arquivo deve ser uma imagem');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Handle cover upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A capa deve ter no máximo 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('O arquivo deve ser uma imagem');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const data: any = {};
      if (displayName !== user?.displayName) data.displayName = displayName;
      if (username !== user?.username) data.username = username;
      if (bio !== user?.bio) data.bio = bio;
      if (location !== user?.location) data.location = location;
      if (website !== user?.website) data.website = website;

      if (Object.keys(data).length > 0 || avatarFile || coverFile) {
        updateProfile(
          { ...data, avatarFile: avatarFile || undefined, coverFile: coverFile || undefined },
          {
            onSuccess: (updatedUser) => {
              updateAuthProfile(updatedUser);
              // Show success toast
            },
          }
        );
      }
    } catch (error) {
      console.error('Save profile failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Save password
  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      alert('A senha deve ter pelo menos 8 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      changePassword(
        { currentPassword, newPassword },
        {
          onSuccess: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            // Show success toast
          },
        }
      );
    } catch (error) {
      console.error('Change password failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    const confirm = window.confirm(
      'Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados serão permanentemente removidos.'
    );
    if (!confirm) return;

    const confirm2 = window.confirm(
      'Último aviso: sua conta, playlists, músicas, seguidores e todo o histórico serão apagados para sempre. Continuar?'
    );
    if (!confirm2) return;

    setIsSaving(true);
    try {
      deleteAccount({
        onSuccess: () => {
          logout();
          navigate('/login');
        },
      });
    } catch (error) {
      console.error('Delete account failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle notification
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle privacy
  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle appearance change
  const handleAppearanceChange = (key: keyof typeof appearance, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
    // Apply theme immediately
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'account', label: 'Conta', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'storage', label: 'Armazenamento', icon: HardDrive },
    { id: 'danger', label: 'Perigo', icon: AlertCircle },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-1">Configurações</h1>
            <p className="text-text-secondary">Gerencie sua conta, preferências e privacidade</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-1">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 px-3 py-2">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" forceMount className="mt-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Avatar & Cover */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Avatar */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Avatar
                      </CardTitle>
                      <CardDescription>JPG, PNG até 5MB. Quadrado recomendado.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative">
                        <Avatar
                          src={avatarPreview}
                          name={displayName}
                          size="xxl"
                          className="mx-auto"
                        />
                        <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer border-2 border-background">
                          <Camera className="w-5 h-5 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {avatarFile && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatarUrl || null); }}>
                          Remover avatar
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  {/* Cover */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Capa do perfil
                      </CardTitle>
                      <CardDescription>JPG, PNG até 10MB. Proporção 3:1 recomendada.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="relative aspect-[3/1] rounded-xl overflow-hidden bg-background-tertiary">
                        {coverPreview ? (
                          <img src={coverPreview} alt="Capa" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30" />
                        )}
                        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {coverFile && (
                        <Button variant="outline" size="sm" className="w-full" onClick={() => { setCoverFile(null); setCoverPreview(user?.coverUrl || null); }}>
                          Remover capa
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações do perfil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="display-name">Nome de exibição</Label>
                          <Input
                            id="display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Seu nome"
                            maxLength={50}
                          />
                        </div>
                        <div>
                          <Label htmlFor="username">Nome de usuário</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">@</span>
                            <Input
                              id="username"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              placeholder="seuusuario"
                              className="pl-7"
                              maxLength={30}
                              pattern="^[a-zA-Z0-9_]+$"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Conte algo sobre você..."
                          rows={3}
                          maxLength={160}
                          className="resize-none"
                        />
                        <div className="flex justify-end text-text-muted text-sm">
                          {bio.length}/160
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Localização</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Sua cidade, país"
                            maxLength={50}
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Site</Label>
                          <Input
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://seusite.com"
                            maxLength={100}
                          />
                        </div>
                      </div>

                      <CardFooter className="flex justify-end">
                        <Button variant="primary" onClick={handleSaveProfile} disabled={isSaving} className="gap-2">
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          {isSaving ? 'Salvando...' : 'Salvar alterações'}
                        </Button>
                      </CardFooter>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account" forceMount className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </CardTitle>
                  <CardDescription>Email usado para login e recuperação de conta</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                      className="bg-background-tertiary/50"
                    />
                    <p className="text-text-muted text-sm mt-1">Para alterar o email, entre em contato com o suporte.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha
                  </CardTitle>
                  <CardDescription>Altere sua senha regularmente para manter sua conta segura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="current-password">Senha atual</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Senha atual"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="new-password">Nova senha</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nova senha (mín. 8 caracteres)"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme a nova senha"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleSavePassword} disabled={isSaving || !currentPassword || !newPassword} className="gap-2">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isSaving ? 'Salvando...' : 'Alterar senha'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Sessões ativas
                  </CardTitle>
                  <CardDescription>Gerencie onde sua conta está logada</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Monitor className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">Navegador atual</p>
                          <p className="text-text-secondary text-sm">Chrome no Windows • Ativo agora</p>
                        </div>
                      </div>
                      <Badge variant="primary" className="text-xs">Atual</Badge>
                    </div>
                    <p className="text-text-muted text-sm">Apenas esta sessão está ativa no momento.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" forceMount className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Preferências de notificação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {([
                      { key: 'email', label: 'Notificações por email', desc: 'Receba notificações por email' },
                      { key: 'push', label: 'Notificações push', desc: 'Receba notificações no navegador' },
                    ] as const).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{item.label}</p>
                          <p className="text-text-secondary text-sm">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key]}
                          onCheckedChange={() => toggleNotification(item.key)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <p className="font-medium text-text-primary mb-3">Atividades</p>
                  <div className="space-y-3">
                    {([
                      { key: 'likes', label: 'Curtidas', desc: 'Quando alguém curte suas músicas/playlists' },
                      { key: 'comments', label: 'Comentários', desc: 'Quando alguém comenta nas suas faixas' },
                      { key: 'follows', label: 'Novos seguidores', desc: 'Quando alguém te segue' },
                      { key: 'reposts', label: 'Reposts', desc: 'Quando alguém reposta seu conteúdo' },
                      { key: 'mentions', label: 'Menções', desc: 'Quando alguém te menciona' },
                    ] as const).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{item.label}</p>
                          <p className="text-text-secondary text-sm">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key]}
                          onCheckedChange={() => toggleNotification(item.key)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <p className="font-medium text-text-primary mb-3">Descoberta</p>
                  <div className="space-y-3">
                    {([
                      { key: 'newReleases', label: 'Novos lançamentos', desc: 'Lançamentos de artistas que você segue' },
                      { key: 'weeklyDigest', label: 'Resumo semanal', desc: 'Resumo da sua atividade semanal' },
                    ] as const).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{item.label}</p>
                          <p className="text-text-secondary text-sm">{item.desc}</p>
                        </div>
                        <Switch
                          checked={notifications[item.key]}
                          onCheckedChange={() => toggleNotification(item.key)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <p className="font-medium text-text-primary mb-3">Marketing</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-text-primary">Emails promocionais</p>
                        <p className="text-text-secondary text-sm">Novidades, ofertas e recomendações</p>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={() => toggleNotification('marketing')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" forceMount className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Visibilidade do perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { value: 'public', label: 'Público', desc: 'Qualquer pessoa pode ver seu perfil e atividade' },
                    { value: 'followers', label: 'Apenas seguidores', desc: 'Apenas quem te segue pode ver seu perfil' },
                    { value: 'private', label: 'Privado', desc: 'Ninguém pode ver seu perfil exceto você' },
                  ] as const).map((item) => (
                    <label key={item.value} className="flex items-center gap-3 p-3 bg-background-tertiary/50 rounded-lg cursor-pointer">
                      <input
                        type="radio"
                        name="profile-visibility"
                        value={item.value}
                        checked={privacy.profileVisibility === item.value}
                        onChange={() => setPrivacy(prev => ({ ...prev, profileVisibility: item.value }))}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        'flex-1 p-3 rounded-lg border-2 transition-colors',
                        privacy.profileVisibility === item.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border-primary hover:border-primary/50'
                      )}>
                        <p className="font-medium text-text-primary">{item.label}</p>
                        <p className="text-text-secondary text-sm">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    O que os outros veem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { key: 'showListeningActivity', label: 'Atividade de reprodução', desc: 'Mostre o que você está ouvindo agora' },
                    { key: 'showFollows', label: 'Quem você segue', desc: 'Mostre sua lista de seguidos' },
                    { key: 'showPlaylists', label: 'Playlists públicas', desc: 'Mostre suas playlists públicas' },
                    { key: 'showEmail', label: 'Email no perfil', desc: 'Mostre seu email publicamente' },
                    { key: 'showLocation', label: 'Localização no perfil', desc: 'Mostre sua localização publicamente' },
                  ] as const).map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-text-primary">{item.label}</p>
                        <p className="text-text-secondary text-sm">{item.desc}</p>
                      </div>
                      <Switch
                        checked={privacy[item.key]}
                        onCheckedChange={() => togglePrivacy(item.key)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Quem pode interagir com você
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {([
                    { key: 'allowMessages', label: 'Mensagens diretas', options: ['everyone', 'followers', 'none'] as const },
                    { key: 'allowMentions', label: 'Menções', options: ['everyone', 'followers', 'none'] as const },
                  ] as const).map((item) => (
                    <div key={item.key} className="space-y-3">
                      <p className="font-medium text-text-primary">{item.label}</p>
                      <div className="flex gap-2">
                        {item.options.map((opt) => (
                          <label key={opt} className="flex-1 p-3 rounded-lg border-2 cursor-pointer transition-colors text-center"
                            className={cn(
                              privacy[item.key] === opt
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border-primary text-text-secondary hover:border-primary/50'
                            )}>
                            <input
                              type="radio"
                              name={item.key}
                              value={opt}
                              checked={privacy[item.key] === opt}
                              onChange={() => setPrivacy(prev => ({ ...prev, [item.key]: opt }))}
                              className="sr-only"
                            />
                            {opt === 'everyone' && 'Todos'}
                            {opt === 'followers' && 'Seguidores'}
                            {opt === 'none' && 'Ninguém'}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" forceMount className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Tema e cores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tema</Label>
                    <div className="flex gap-2 mt-2">
                      {(['light', 'dark', 'system'] as const).map((theme) => (
                        <label key={theme} className="flex-1 p-3 rounded-lg border-2 cursor-pointer text-center transition-colors"
                          className={cn(
                            appearance.theme === theme
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border-primary text-text-secondary hover:border-primary/50'
                          )}>
                          <input
                            type="radio"
                            name="theme"
                            value={theme}
                            checked={appearance.theme === theme}
                            onChange={() => handleAppearanceChange('theme', theme)}
                            className="sr-only"
                          />
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Cor de destaque</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <input
                        type="color"
                        value={appearance.accentColor}
                        onChange={(e) => handleAppearanceChange('accentColor', e.target.value)}
                        className="w-12 h-12 rounded-lg border-2 border-border-primary cursor-pointer"
                      />
                      <Input
                        value={appearance.accentColor}
                        onChange={(e) => handleAppearanceChange('accentColor', e.target.value)}
                        className="w-32 font-mono text-sm"
                      />
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    {([
                      { key: 'compactMode', label: 'Modo compacto', desc: 'Interface mais densa com menos espaçamento' },
                      { key: 'animations', label: 'Animações', desc: 'Ative transições e animações suaves' },
                    ] as const).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{item.label}</p>
                          <p className="text-text-secondary text-sm">{item.desc}</p>
                        </div>
                        <Switch
                          checked={appearance[item.key]}
                          onCheckedChange={() => handleAppearanceChange(item.key, !appearance[item.key])}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Reprodução
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {([
                      { key: 'autoPlay', label: 'Reprodução automática', desc: 'Continue tocando músicas similares quando a fila acabar' },
                      { key: 'crossfade', label: 'Crossfade', desc: 'Transição suave entre faixas' },
                      { key: 'normalizeVolume', label: 'Normalizar volume', desc: 'Ajuste automático do volume entre faixas' },
                    ] as const).map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 bg-background-tertiary/50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{item.label}</p>
                          <p className="text-text-secondary text-sm">{item.desc}</p>
                        </div>
                        <Switch
                          checked={appearance[item.key]}
                          onCheckedChange={() => handleAppearanceChange(item.key, !appearance[item.key])}
                        />
                      </div>
                    ))}
                  </div>

                  {appearance.crossfade && (
                    <div className="space-y-2">
                      <Label>Duração do crossfade (segundos)</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="12"
                          value={appearance.crossfadeDuration}
                          onChange={(e) => handleAppearanceChange('crossfadeDuration', parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="text-text-primary font-mono w-12 text-right">{appearance.crossfadeDuration}s</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Storage Tab */}
            <TabsContent value="storage" forceMount className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Uso de armazenamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      { label: 'Músicas enviadas', value: '0', icon: Music },
                      { label: 'Capas de playlist', value: '0', icon: Image },
                      { label: 'Total', value: '0 MB', icon: HardDrive },
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-background-tertiary/50 rounded-xl text-center">
                        <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-2xl font-bold text-text-primary">{item.value}</p>
                        <p className="text-text-secondary text-sm">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <p className="font-medium text-text-primary">Limites da conta gratuita</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-background-tertiary/50 rounded-lg">
                        <p className="font-medium text-text-primary">Músicas: 0 / 500</p>
                        <div className="w-full h-2 bg-background-secondary rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
                        </div>
                      </div>
                      <div className="p-3 bg-background-tertiary/50 rounded-lg">
                        <p className="font-medium text-text-primary">Armazenamento: 0 MB / 2 GB</p>
                        <div className="w-full h-2 bg-background-secondary rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Danger Zone Tab */}
            <TabsContent value="danger" forceMount className="mt-6 space-y-6">
              <Card className="border-error/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-error">
                    <AlertCircle className="w-4 h-4" />
                    Zona de perigo
                  </CardTitle>
                  <CardDescription>Estas ações são irreversíveis. Tenha certeza antes de prosseguir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-error/10 rounded-xl border border-error/20">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-error mb-1">Excluir conta permanentemente</p>
                        <p className="text-text-secondary text-sm">
                          Isso removerá permanentemente sua conta, todas as suas músicas, playlists, seguidores, histórico de reprodução e dados associados. Esta ação não pode ser desfeita.
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={isSaving}
                        className="gap-2 shrink-0"
                      >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        {isSaving ? 'Excluindo...' : 'Excluir conta'}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-background-tertiary/50 rounded-xl">
                    <p className="font-medium text-text-primary mb-2">Exportar seus dados</p>
                    <p className="text-text-secondary text-sm mb-4">
                      Baixe uma cópia de todos os seus dados (músicas, playlists, histórico, configurações) em formato JSON.
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Solicitar download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}

import { Monitor, Download } from 'lucide-react';