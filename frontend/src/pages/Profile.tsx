/**
 * Hub Music - Profile Page
 * Página de perfil do usuário/artista: faixas, playlists e estatísticas
 * User/Artist profile page: tracks, playlists and stats
 * 
 * @languages pt-BR / en-US
 */

import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { api } from '@/lib/api';
import { formatNumber, formatRelativeTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrackCard } from '../components/track/TrackCard';
import { PlaylistCard } from '../components/playlist/PlaylistCard';
import { TabButton } from '../components/ui/tab-button';
import {
  User,
  Music,
  Heart,
  ListMusic,
  Users,
  Settings,
  Edit,
  MoreHorizontal,
  Globe,
  Lock,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';
import { useState } from 'react';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tracks' | 'likes' | 'playlists' | 'following' | 'followers'>('tracks');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', bio: '' });

  const { data: profileData, isLoading, error } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const response = await api.axios.get(`/users/${username}`);
      return response.data.user;
    },
    enabled: !!username
  });

  const { data: tracksData } = useQuery({
    queryKey: ['profile', username, 'tracks'],
    queryFn: async () => {
      const response = await api.getTracks({ userId: profileData?.id, limit: 20 });
      return response.data.tracks;
    },
    enabled: !!profileData?.id && activeTab === 'tracks'
  });

  const { data: likesData } = useQuery({
    queryKey: ['profile', username, 'likes'],
    queryFn: async () => {
      const response = await api.getUserLikes(profileData!.id, { limit: 20 });
      return response.data.tracks;
    },
    enabled: !!profileData?.id && activeTab === 'likes'
  });

  const { data: playlistsData } = useQuery({
    queryKey: ['profile', username, 'playlists'],
    queryFn: async () => {
      const response = await api.getPlaylists({ userId: profileData!.id, limit: 20 });
      return response.data.playlists;
    },
    enabled: !!profileData?.id && activeTab === 'playlists'
  });

  const { data: followingData } = useQuery({
    queryKey: ['profile', username, 'following'],
    queryFn: async () => {
      const response = await api.getFollowing(profileData!.id, { limit: 20 });
      return response.data.following;
    },
    enabled: !!profileData?.id && activeTab === 'following'
  });

  const { data: followersData } = useQuery({
    queryKey: ['profile', username, 'followers'],
    queryFn: async () => {
      const response = await api.getFollowers(profileData!.id, { limit: 20 });
      return response.data.followers;
    },
    enabled: !!profileData?.id && activeTab === 'followers'
  });

  const followMutation = useMutation({
    mutationFn: () => api.toggleFollow(profileData!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.axios.patch('/auth/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      setEditing(false);
    }
  });

  const profile = profileData;
  const isOwnProfile = currentUser && profile?.id === currentUser.id;
  const canEdit = isOwnProfile;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-heading-md font-bold mb-2">Usuário não encontrado</h2>
        <p className="text-text-secondary">Este perfil pode não existir ou ter sido removido.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="space-y-6">
        {/* Cover */}
        <div className="relative h-48 lg:h-64 rounded-2xl overflow-hidden">
          {profile.coverUrl ? (
            <img src={profile.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary-light/20 to-background-secondary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="relative -mt-20 lg:-mt-28 px-4 lg:px-6 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar
                src={profile.avatarUrl}
                name={profile.displayName}
                size="2xl"
                className="ring-4 ring-background"
              />
              {canEdit && (
                <button
                  onClick={() => {}}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:shadow-glow"
                  aria-label="Alterar avatar"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left space-y-3">
              <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <h1 className="text-display-sm font-bold">{profile.displayName}</h1>
                {profile.verified && (
                  <span className="flex items-center gap-1 text-primary" title="Verificado">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  </span>
                )}
              </div>

              <p className="text-text-secondary">@{profile.username}</p>

              {profile.bio && (
                <p className="text-text-primary max-w-2xl">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center lg:justify-start gap-6 lg:gap-8 pt-2">
                <StatItem label="Faixas" value={profile._count?.tracks || 0} />
                <StatItem label="Playlists" value={profile._count?.playlists || 0} />
                <StatItem label="Seguidores" value={profile._count?.followers || 0} />
                <StatItem label="Seguindo" value={profile._count?.following || 0} />
              </div>

              {/* Account type badges */}
              <div className="flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                <Badge variant={profile.accountType === 'ARTIST' || profile.accountType === 'BOTH' ? 'primary' : 'outline'}>
                  <Music className="w-3 h-3 mr-1" /> Artista
                </Badge>
                <Badge variant={profile.accountType === 'LISTENER' || profile.accountType === 'BOTH' ? 'secondary' : 'outline'}>
                  <Heart className="w-3 h-3 mr-1" /> Ouvinte
                </Badge>
                <Badge variant={profile.accountType === 'BOTH' ? 'success' : 'outline'} className="hidden sm:inline-flex">
                  Ambos
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap pt-2">
                {!isOwnProfile && (
                  <Button
                    onClick={() => followMutation.mutate()}
                    variant={profile.isFollowing ? 'secondary' : 'primary'}
                    className="whitespace-nowrap"
                  >
                    {profile.isFollowing ? 'Deixar de seguir' : 'Seguir'}
                  </Button>
                )}

                {canEdit && !editing && (
                  <Button variant="ghost" onClick={() => setEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar perfil
                  </Button>
                )}

                {canEdit && editing && (
                  <>
                    <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
                    <Button onClick={() => updateProfileMutation.mutate(editData)} disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {canEdit && editing && (
            <Card className="p-4 space-y-4 max-w-2xl mx-auto lg:mx-0">
              <Input
                label="Nome de exibição"
                value={editData.displayName}
                onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                defaultValue={profile.displayName}
              />
              <Textarea
                label="Bio"
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                defaultValue={profile.bio}
                rows={3}
                helperText="Máximo 160 caracteres"
              />
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => { setEditData({ displayName: profile.displayName, bio: profile.bio || '' }); setEditing(false); }}>Cancelar</Button>
                <Button onClick={() => updateProfileMutation.mutate(editData)} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/50">
        <nav className="flex gap-1 px-1" role="tablist">
          {[
            { id: 'tracks', label: 'Faixas', icon: Music, count: profile._count?.tracks || 0 },
            { id: 'likes', label: 'Curtidas', icon: Heart, count: 0 },
            { id: 'playlists', label: 'Playlists', icon: ListMusic, count: profile._count?.playlists || 0 },
            { id: 'following', label: 'Seguindo', icon: Users, count: profile._count?.following || 0 },
            { id: 'followers', label: 'Seguidores', icon: Users, count: profile._count?.followers || 0 }
          ].map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              icon={tab.icon}
              count={tab.count}
            />
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-6">
        {activeTab === 'tracks' && (
          <TrackTabContent tracks={tracksData?.tracks || []} loading={tracksData === undefined} />
        )}
        {activeTab === 'likes' && (
          <TrackTabContent tracks={likesData?.tracks || []} loading={likesData === undefined} emptyMessage="Nenhuma faixa curtida ainda" />
        )}
        {activeTab === 'playlists' && (
          <PlaylistTabContent playlists={playlistsData?.playlists || []} loading={playlistsData === undefined} emptyMessage="Nenhuma playlist criada ainda" />
        )}
        {activeTab === 'following' && (
          <UserTabContent users={followingData?.following || []} loading={followingData === undefined} emptyMessage="Não está seguindo ninguém ainda" />
        )}
        {activeTab === 'followers' && (
          <UserTabContent users={followersData?.followers || []} loading={followersData === undefined} emptyMessage="Nenhum seguidor ainda" />
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-heading-md font-bold">{formatNumber(value)}</p>
      <p className="text-text-muted text-sm">{label}</p>
    </div>
  );
}

function TrackTabContent({ tracks, loading, emptyMessage = "Nenhuma faixa encontrada" }: { tracks: any[]; loading: boolean; emptyMessage?: string }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => <TrackCardSkeleton key={i} />)}
      </div>
    );
  }

  if (tracks.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} variant="compact" />
      ))}
    </div>
  );
}

function PlaylistTabContent({ playlists, loading, emptyMessage = "Nenhuma playlist encontrada" }: { playlists: any[]; loading: boolean; emptyMessage?: string }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <PlaylistCardSkeleton key={i} />)}
      </div>
    );
  }

  if (playlists.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {playlists.map((playlist) => (
        <PlaylistCard key={playlist.id} playlist={playlist} />
      ))}
    </div>
  );
}

function UserTabContent({ users, loading, emptyMessage = "Nenhum usuário encontrado" }: { users: any[]; loading: boolean; emptyMessage?: string }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => <UserSkeleton key={i} />)}
      </div>
    );
  }

  if (users.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <UserProfileItem key={user.id} user={user} />
      ))}
    </div>
  );
}

function UserProfileItem({ user }: { user: any }) {
  return (
    <div className="card-interactive p-3 flex items-center gap-4">
      <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="lg" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{user.displayName || user.username}</p>
        <p className="text-text-muted text-sm">@{user.username}</p>
      </div>
      {user.isFollowing && <Badge variant="secondary" size="sm">Seguindo</Badge>}
    </div>
  );
}

function TrackCardSkeleton() {
  return (
    <div className="card-interactive p-4 space-y-3 animate-pulse">
      <div className="aspect-square bg-background-tertiary rounded-xl" />
      <div className="h-4 bg-background-tertiary rounded w-3/4" />
      <div className="h-3 bg-background-tertiary rounded w-1/2" />
    </div>
  );
}

function PlaylistCardSkeleton() {
  return (
    <div className="card-interactive p-4 space-y-3 animate-pulse">
      <div className="aspect-square bg-background-tertiary rounded-xl" />
      <div className="h-5 bg-background-tertiary rounded w-3/4" />
      <div className="h-4 bg-background-tertiary rounded w-1/2" />
    </div>
  );
}

function UserSkeleton() {
  return (
    <div className="card p-3 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-full bg-background-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-background-tertiary rounded w-1/3" />
        <div className="h-3 bg-background-tertiary rounded w-1/4" />
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Music className="w-12 h-12 text-text-muted/50 mb-4" />
      <p className="text-text-secondary">{message}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-48 lg:h-64 rounded-2xl bg-background-tertiary" />
      <div className="relative -mt-20 lg:-mt-28 px-4 lg:px-6 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-background-tertiary mx-auto lg:mx-0" />
          <div className="flex-1 text-center lg:text-left space-y-3">
            <div className="h-8 bg-background-tertiary rounded w-1/2 mx-auto lg:mx-0" />
            <div className="h-5 bg-background-tertiary rounded w-1/3 mx-auto lg:mx-0" />
            <div className="flex items-center justify-center lg:justify-start gap-6 lg:gap-8 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-background-tertiary rounded w-full mb-1" />
                  <div className="h-3 bg-background-tertiary rounded w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Textarea } from '../components/ui/input';
import { Music } from 'lucide-react';