/**
 * Hub Music - BuddyFeedPage
 * Feed de atividade dos amigos (estilo SoundCloud/Spotify)
 * Friends activity feed
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { Clock, Heart, Share2, MessageSquare, Music, User, Users, Play, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { Avatar } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '../../ui/dropdown-menu';
import { TrackCard } from '../../../components/track/TrackCard';
import { PlaylistCard } from '../../../components/playlist/PlaylistCard';
import { ArtistCard } from '../../../components/artist/ArtistCard';
import { formatRelativeTime, formatNumber } from '../../../lib/utils';
import { useFeed } from '../../../hooks/data/useSocial';
import { usePlayerStore } from '../../../state/playerStore';
import { cn } from '../../../lib/utils';

interface FeedActivity {
  id: string;
  type: 'like' | 'repost' | 'follow' | 'playlist_create' | 'track_upload' | 'comment';
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  target?: {
    id: string;
    type: 'track' | 'playlist' | 'artist' | 'album';
    title: string;
    coverUrl?: string;
    artist?: string;
  };
  createdAt: string;
}

export function BuddyFeedPage() {
  const { play } = usePlayerStore();
  const [filter, setFilter] = useState<'all' | 'following' | 'friends'>('following');
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Mock data for now
  useEffect(() => {
    const mockActivities: FeedActivity[] = [
      {
        id: '1',
        type: 'like',
        user: { id: '1', displayName: 'João Silva', username: 'joaosilva', avatarUrl: 'https://picsum.photos/seed/user1/100/100', verified: true },
        target: { id: 't1', type: 'track', title: 'Midnight Dreams', coverUrl: 'https://picsum.photos/seed/track1/300/300', artist: 'Luna' },
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'repost',
        user: { id: '2', displayName: 'Maria Santos', username: 'mariasantos', avatarUrl: 'https://picsum.photos/seed/user2/100/100' },
        target: { id: 'p1', type: 'playlist', title: 'Chill Vibes', coverUrl: 'https://picsum.photos/seed/playlist1/300/300' },
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'follow',
        user: { id: '3', displayName: 'Pedro Costa', username: 'pedrocosta', avatarUrl: 'https://picsum.photos/seed/user3/100/100' },
        target: { id: 'a1', type: 'artist', title: 'The Weeknd', coverUrl: 'https://picsum.photos/seed/artist1/300/300' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'playlist_create',
        user: { id: '1', displayName: 'João Silva', username: 'joaosilva', avatarUrl: 'https://picsum.photos/seed/user1/100/100', verified: true },
        target: { id: 'p2', type: 'playlist', title: 'Workout Mix 2024', coverUrl: 'https://picsum.photos/seed/playlist2/300/300' },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'track_upload',
        user: { id: '4', displayName: 'Ana Lima', username: 'analima', avatarUrl: 'https://picsum.photos/seed/user4/100/100' },
        target: { id: 't2', type: 'track', title: 'Sunrise', coverUrl: 'https://picsum.photos/seed/track2/300/300', artist: 'Ana Lima' },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    setActivities(mockActivities);
    setIsLoading(false);
  }, [filter]);

  const getActivityIcon = (type: FeedActivity['type']) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-error" />;
      case 'repost': return <Share2 className="w-4 h-4 text-primary" />;
      case 'follow': return <UserPlus className="w-4 h-4 text-success" />;
      case 'playlist_create': return <ListMusic className="w-4 h-4 text-primary" />;
      case 'track_upload': return <Music className="w-4 h-4 text-primary" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-primary" />;
    }
  };

  const getActivityText = (activity: FeedActivity) => {
    const userName = activity.user.displayName || activity.user.username;
    const target = activity.target;

    switch (activity.type) {
      case 'like':
        return `${userName} curtiu <strong>${target?.title}</strong>${target?.artist ? ` por ${target.artist}` : ''}`;
      case 'repost':
        return `${userName} repostou <strong>${target?.title}</strong>`;
      case 'follow':
        return `${userName} começou a seguir <strong>${target?.title}</strong>`;
      case 'playlist_create':
        return `${userName} criou a playlist <strong>${target?.title}</strong>`;
      case 'track_upload':
        return `${userName} enviou <strong>${target?.title}</strong>`;
      case 'comment':
        return `${userName} comentou em <strong>${target?.title}</strong>`;
    }
  };

  const handleTargetClick = (activity: FeedActivity) => {
    if (!activity.target) return;
    const { type, id } = activity.target;
    const routeMap: Record<string, string> = {
      track: '/track',
      playlist: '/playlist',
      artist: '/artist',
      album: '/album',
    };
    if (routeMap[type]) {
      navigate(`${routeMap[type]}/${id}`);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-8 bg-background-tertiary rounded w-1/3" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-3">
              <div className="w-10 h-10 rounded-full bg-background-tertiary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-background-tertiary rounded w-1/2" />
                <div className="h-3 bg-background-tertiary rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Feed de atividades</h1>
              <p className="text-text-secondary">O que seus amigos estão ouvindo</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="w-4 h-4" />
                  {filter === 'all' && 'Todos'}
                  {filter === 'following' && 'Seguindo'}
                  {filter === 'friends' && 'Amigos'}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filtrar feed</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setFilter('all')}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('following')}>Seguindo</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('friends')}>Amigos</DropdownMenuItem>
              </DropdownMenuContent            </DropdownMenu>
          </div>

          {/* Activities */}
          {activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <article
                  key={activity.id}
                  className="card-hover p-4 flex gap-3 group"
                  onClick={() => handleTargetClick(activity)}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={activity.user.avatarUrl}
                      name={activity.user.displayName || activity.user.username}
                      size="md"
                    />
                    {activity.user.verified && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 font-medium text-text-primary hover:text-primary"
                        onClick={(e) => { e.stopPropagation(); handleUserClick(activity.user.id); }}
                      >
                        {activity.user.displayName || activity.user.username}
                      </Button>
                      <span className="text-text-muted text-sm mt-0.5" dangerouslySetInnerHTML={{ __html: getActivityText(activity) }} />
                    </div>

                    {/* Target Preview */}
                    {activity.target && (
                      <div className="flex items-center gap-3 mt-2">
                        <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
                          {activity.target.coverUrl ? (
                            <img src={activity.target.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-background-tertiary flex items-center justify-center">
                              <Music className="w-5 h-5 text-text-muted" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-primary truncate">{activity.target.title}</p>
                          {activity.target.artist && (
                            <p className="text-text-secondary text-sm truncate">{activity.target.artist}</p>
                          )}
                          {activity.target.type === 'playlist' && (
                            <p className="text-text-muted text-sm">Playlist</p>
                          )}
                        </div>
                        {activity.type === 'like' || activity.type === 'repost' ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); play({ type: activity.target!.type as any, [activity.target!.type + 'Id']: activity.target!.id }); }}
                            aria-label="Reproduzir"
                          >
                            <Play className="w-5 h-5" />
                          </Button>
                        ) : null}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-text-muted text-sm">
                      <span>{formatRelativeTime(activity.createdAt)}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="p-1" aria-label="Mais opções">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTargetClick(activity)}>
                            Ver {activity.target?.type === 'track' ? 'faixa' : activity.target?.type === 'playlist' ? 'playlist' : 'artista'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleUserClick(activity.user.id); }}>
                            Ver perfil
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" /> Denunciar atividade
                          </DropdownMenuItem>
                        </DropdownMenuContent
                      </DropdownMenu>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-text-muted" />
              <h3 className="font-medium text-text-primary mb-2">Nenhuma atividade recente</h3>
              <p className="text-text-secondary mb-4">
                Siga artistas e amigos para ver suas atividades aqui
              </p>
              <Button variant="primary" size="sm" onClick={() => navigate('/search')}>
                <Search className="w-4 h-4 mr-2" />
                Descobrir pessoas
              </Button>
            </div>
          )}

          {/* Load More */}
          {hasMore && (
            <Button variant="outline" className="w-full" onClick={() => {}}>
              Carregar mais atividades
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

import { useEffect, useNavigate } from 'react';
import { Filter, ChevronDown, Search, Flag, Check, UserPlus, ListMusic, Users, Navigate } from 'lucide-react';