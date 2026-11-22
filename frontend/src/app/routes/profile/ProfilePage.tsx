/**
 * Hub Music - ProfilePage
 * Página de perfil do usuário com abas
 * User profile page with tabs
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Music, ListMusic, Heart, UserPlus, UserCheck, Users,
  Settings, Edit, MoreHorizontal, ChevronRight, Share2,
  Calendar, Music as MusicIcon, Clock, Globe
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/tabs';
import { ScrollArea } from '@/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { TrackCard } from '@/components/track/TrackCard';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { ArtistCard } from '@/components/artist/ArtistCard';
import { useProfile, useFollowUser, useUserPlaylists, useUserTracks, useUserLikes } from '@/hooks/data/useProfile';
import { formatNumber, formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ProfilePageProps {
  username?: string;
}

export function ProfilePage({ username: propUsername }: ProfilePageProps) {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const targetUsername = propUsername || username;

  // Current user (from auth context) - TODO: get from useAuth
  const isOwnProfile = targetUsername === 'current-user'; // TODO: compare with actual current user

  // Data fetching
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfile(targetUsername || '', { enabled: !!targetUsername });
  const { data: playlists, isLoading: playlistsLoading } = useUserPlaylists(targetUsername || '', { enabled: !!targetUsername });
  const { data: tracks, isLoading: tracksLoading } = useUserTracks(targetUsername || '', { enabled: !!targetUsername });
  const { data: likes, isLoading: likesLoading } = useUserLikes(targetUsername || '', { enabled: !!targetUsername });
  const { mutate: followUser } = useFollowUser();

  // Local state
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'likes' | 'following' | 'followers'>('tracks');

  // Handle follow
  const handleFollowClick = () => {
    if (!profile) return;
    followUser(profile.id);
  };

  // Handle edit profile (own profile only)
  const handleEditProfile = () => {
    navigate('/settings');
  };

  if (profileLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-full bg-background-tertiary flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-background-tertiary rounded w-1/3" />
              <div className="h-4 bg-background-tertiary rounded w-1/4" />
              <div className="h-10 bg-background-tertiary rounded w-24" />
            </div>
          </div>
          <div className="flex gap-4 border-b border-border-primary">
            <div className="h-8 bg-background-tertiary rounded px-4" />
            <div className="h-8 bg-background-tertiary rounded px-4" />
            <div className="h-8 bg-background-tertiary rounded px-4" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-background-tertiary rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex-1 overflow-y-auto bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <User className="w-16 h-16 mx-auto mb-4 text-text-muted" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Perfil não encontrado</h1>
          <p className="text-text-secondary mb-6">Este usuário pode não existir ou o nome de usuário está incorreto.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Voltar para o início
          </Button>
        </div>
      </div>
    );
  }

  const displayName = profile.displayName || profile.username;
  const isFollowing = profile.isFollowing || false;
  const followerCount = profile._count?.followers || 0;
  const followingCount = profile._count?.following || 0;
  const playlistCount = profile._count?.playlists || 0;
  const trackCount = profile._count?.tracks || 0;
  const likeCount = profile._count?.likes || 0;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {/* Profile Header */}
          <header className="relative">
            {/* Cover */}
            <div className="relative h-48 md:h-64 rounded-t-2xl overflow-hidden">
              {profile.coverUrl ? (
                <img
                  src={profile.coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            </div>

            {/* Avatar & Info */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-16 md:-mt-20 px-4 md:px-6 relative z-10">
              <div className="relative">
                <Avatar
                  src={profile.avatarUrl}
                  name={displayName}
                  size="xxl"
                  className="ring-4 ring-background"
                />
                {profile.verified && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 mt-4 md:mt-0 md:mb-4">
                <div className="flex items-baseline gap-3 flex-wrap mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-text-primary truncate">
                    {displayName}
                  </h1>
                  {profile.verified && (
                    <Tooltip content="Verificado">
                      <Badge variant="primary" className="gap-1 text-sm">
                        <Check className="w-3 h-3" />
                        Verificado
                      </Badge>
                    </Tooltip>
                  )}
                </div>

                <p className="text-text-secondary">@{profile.username}</p>

                {profile.bio && (
                  <p className="text-text-secondary mt-2 line-clamp-3">{profile.bio}</p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4 text-text-muted text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-0 gap-1"
                    onClick={() => setActiveTab('following')}
                  >
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(followingCount)} seguindo</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-0 gap-1"
                    onClick={() => setActiveTab('followers')}
                  >
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(followerCount)} seguidores</span>
                  </Button>
                  <span className="flex items-center gap-1">
                    <MusicIcon className="w-4 h-4" />
                    {formatNumber(playlistCount)} playlists
                  </span>
                </div>

                {/* Location/Join Date */}
                {profile.location || profile.createdAt ? (
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-text-muted text-sm">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {profile.location}
                      </span>
                    )}
                    {profile.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Membro desde {new Date(profile.createdAt).getFullYear()}
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0 md:ml-auto">
                {isOwnProfile ? (
                  <Button variant="outline" onClick={handleEditProfile} className="gap-2">
                    <Edit className="w-4 h-4" />
                    Editar perfil
                  </Button>
                ) : (
                  <>
                    <Button
                      variant={isFollowing ? 'secondary' : 'outline'}
                      onClick={handleFollowClick}
                      className="gap-2"
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Seguindo
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Seguir
                        </>
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="p-2" aria-label="Mais opções">
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleShare}>
                          <Share2 className="w-4 h-4 mr-2" /> Compartilhar perfil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-error">
                          <Flag className="w-4 h-4 mr-2" /> Denunciar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="border-b border-border-primary">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1">
                <TabsTrigger value="tracks">
                  <Music className="w-4 h-4 mr-2" />
                  Músicas
                  <Badge variant="secondary" className="ml-2 text-[10px]">{trackCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="playlists">
                  <ListMusic className="w-4 h-4 mr-2" />
                  Playlists
                  <Badge variant="secondary" className="ml-2 text-[10px]">{playlistCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="likes">
                  <Heart className="w-4 h-4 mr-2" />
                  Curtidas
                  <Badge variant="secondary" className="ml-2 text-[10px]">{likeCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="following">
                  <Users className="w-4 h-4 mr-2" />
                  Seguindo
                  <Badge variant="secondary" className="ml-2 text-[10px]">{followingCount}</Badge>
                </TabsTrigger>
                <TabsTrigger value="followers">
                  <Users className="w-4 h-4 mr-2" />
                  Seguidores
                  <Badge variant="secondary" className="ml-2 text-[10px]">{followerCount}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Tracks Tab */}
            <TabsContent value="tracks" forceMount>
              {tracksLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse aspect-square bg-background-tertiary rounded-xl" />
                  ))}
                </div>
              ) : tracks && tracks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {tracks.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <h3 className="font-medium text-text-primary mb-2">Nenhuma música publicada</h3>
                  <p className="text-text-secondary">{isOwnProfile ? 'Suas músicas aparecerão aqui' : 'Este usuário não publicou músicas'}</p>
                </div>
              )}
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists" forceMount>
              {playlistsLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse aspect-square bg-background-tertiary rounded-xl" />
                  ))}
                </div>
              ) : playlists && playlists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {playlists.map((playlist) => (
                    <PlaylistCard key={playlist.id} playlist={playlist} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ListMusic className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <h3 className="font-medium text-text-primary mb-2">Nenhuma playlist</h3>
                  <p className="text-text-secondary">{isOwnProfile ? 'Crie sua primeira playlist' : 'Este usuário não tem playlists públicas'}</p>
                </div>
              )}
            </TabsContent>

            {/* Likes Tab */}
            <TabsContent value="likes" forceMount>
              {likesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse aspect-square bg-background-tertiary rounded-xl" />
                  ))}
                </div>
              ) : likes && likes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {likes.map((track) => (
                    <TrackCard key={track.id} track={track} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                  <h3 className="font-medium text-text-primary mb-2">Nenhuma curtida</h3>
                  <p className="text-text-secondary">{isOwnProfile ? 'Suas músicas curtidas aparecerão aqui' : 'Este usuário não curtiu músicas publicamente'}</p>
                </div>
              )}
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" forceMount>
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <h3 className="font-medium text-text-primary mb-2">Seguindo</h3>
                <p className="text-text-secondary">Lista de usuários que {isOwnProfile ? 'você segue' : 'este usuário segue'}</p>
              </div>
            </TabsContent>

            {/* Followers Tab */}
            <TabsContent value="followers" forceMount>
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <h3 className="font-medium text-text-primary mb-2">Seguidores</h3>
                <p className="text-text-secondary">Lista de usuários que {isOwnProfile ? 'te seguem' : 'seguem este usuário'}</p>
              </div>
            </TabsContent>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

import { Check, UserCheck, Loader2, Share2, Flag } from 'lucide-react';
import { Tooltip } from '@/ui/tooltip';export default ProfilePage;
