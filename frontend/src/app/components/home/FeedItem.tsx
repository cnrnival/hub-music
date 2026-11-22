/**
 * Hub Music - FeedItem
 * Item de feed vertical (WhatsNew, Activity, BuddyFeed)
 * Vertical feed item (WhatsNew, Activity, BuddyFeed)
 *
 * @languages pt-BR / en-US
 */

import { Play, Heart, Repeat, Share2, MoreHorizontal, Clock, Calendar, Music, Users, Film, Mic, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Badge } from '@/common/Badge';
import { Avatar } from '@/common/Avatar';
import { DropdownMenu } from '@/common/DropdownMenu';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';

type FeedItemType = 'track' | 'album' | 'playlist' | 'artist' | 'show' | 'episode' | 'activity';

interface FeedItemProps {
  type: FeedItemType;
  // Activity specific
  activity?: {
    user: {
      id: string;
      name: string;
      username: string;
      avatarUrl?: string;
    };
    action: 'liked' | 'reposted' | 'followed' | 'created_playlist' | 'followed_artist' | 'listening';
    target: any;
    timestamp: string;
  };
  // Content specific (for WhatsNew)
  content?: {
    id: string;
    title: string;
    subtitle?: string;
    coverUrl: string;
    type: FeedItemType;
    releaseDate?: string;
    duration?: number;
    artist?: string;
    explicit?: boolean;
    source?: string;
  };
  onPlay?: () => void;
  onAction?: (action: string) => void;
  compact?: boolean;
}

export function FeedItem({
  type,
  activity,
  content,
  onPlay,
  onAction,
  compact = false,
}: FeedItemProps) {
  const { play, addToQueue } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  const isActivity = !!activity;

  if (isActivity) {
    return <ActivityFeedItem activity={activity!} compact={compact} />;
  }

  if (content) {
    return <ContentFeedItem content={content} compact={compact} />;
  }

  return null;
}

function ActivityFeedItem({
  activity,
  compact,
}: {
  activity: FeedItemProps['activity'];
  compact: boolean;
}) {
  const { user, action, target, timestamp } = activity;

  const getActionIcon = () => {
    switch (action) {
      case 'liked': return <Heart className="w-4 h-4 text-primary" />;
      case 'reposted': return <Repeat className="w-4 h-4 text-secondary" />;
      case 'followed': return <Users className="w-4 h-4 text-success" />;
      case 'created_playlist': return <Film className="w-4 h-4 text-primary" />;
      case 'followed_artist': return <Users className="w-4 h-4 text-primary" />;
      case 'listening': return <Music className="w-4 h-4 text-primary animate-pulse" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  const getActionText = () => {
    switch (action) {
      case 'liked': return 'curtiu';
      case 'reposted': return 'repostou';
      case 'followed': return 'começou a seguir';
      case 'created_playlist': return 'criou a playlist';
      case 'followed_artist': return 'começou a seguir';
      case 'listening': return 'está ouvindo';
      default: return 'atividade';
    }
  };

  const getTargetPreview = () => {
    if (!target) return null;

    switch (target.type) {
      case 'track':
        return (
          <div className="flex items-center gap-3">
            <img src={target.coverUrl} alt={target.title} className="w-12 h-12 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="font-medium text-text-primary truncate">{target.title}</p>
              <p className="text-sm text-text-secondary truncate">{target.artist}</p>
            </div>
          </div>
        );
      case 'album':
        return (
          <div className="flex items-center gap-3">
            <img src={target.coverUrl} alt={target.title} className="w-12 h-12 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="font-medium text-text-primary truncate">{target.title}</p>
              <p className="text-sm text-text-secondary truncate">{target.artist} · Álbum</p>
            </div>
          </div>
        );
      case 'playlist':
        return (
          <div className="flex items-center gap-3">
            {target.coverUrl ? (
              <img src={target.coverUrl} alt={target.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Film className="w-6 h-6 text-white/80" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-text-primary truncate">{target.name}</p>
              <p className="text-sm text-text-secondary truncate">Playlist · {target.trackCount} faixas</p>
            </div>
          </div>
        );
      case 'artist':
        return (
          <div className="flex items-center gap-3">
            <Avatar src={target.avatarUrl} name={target.name} size="md" />
            <div className="min-w-0">
              <p className="font-medium text-text-primary truncate">{target.name}</p>
              <p className="text-sm text-text-secondary truncate">Artista</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'group relative p-4 rounded-xl',
      'hover:bg-background-tertiary transition-colors',
      compact && 'py-3'
    )}>
      <div className="flex gap-3">
        {/* User Avatar */}
        <Avatar src={user.avatarUrl} name={user.name} size={compact ? 'sm' : 'md'} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className={cn('text-text-primary', compact && 'text-sm')}>
                <span className="font-medium hover:text-primary transition-colors">{user.name}</span>
                <span className="text-text-secondary mx-1">{getActionText()}</span>
                {target && (
                  <span className="font-medium hover:text-primary transition-colors">{target.title || target.name}</span>
                )}
              </p>
              <p className={cn('text-text-muted', compact && 'text-xs')}>
                {formatRelativeTime(timestamp)}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ocultar atividade</DropdownMenuItem>
                <DropdownMenuItem>Não mostrar mais de {user.name}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-error">Denunciar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Target Preview */}
          {target && !compact && (
            <div className="mt-3 pt-3 border-t border-border-primary/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 p-2 hover:bg-background-tertiary"
                onClick={() => { /* navigate to target */ }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center">
                  {getActionIcon()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  {target.type === 'track' && (
                    <>
                      <p className="font-medium text-text-primary truncate">{target.title}</p>
                      <p className="text-sm text-text-secondary truncate">{target.artist} · {formatDuration(target.duration)}</p>
                    </>
                  )}
                  {target.type === 'album' && (
                    <>
                      <p className="font-medium text-text-primary truncate">{target.title}</p>
                      <p className="text-sm text-text-secondary truncate">{target.artist} · Álbum</p>
                    </>
                  )}
                  {target.type === 'playlist' && (
                    <>
                      <p className="font-medium text-text-primary truncate">{target.name}</p>
                      <p className="text-sm text-text-secondary truncate">Playlist · {target.trackCount} faixas</p>
                    </>
                  )}
                  {target.type === 'artist' && (
                    <>
                      <p className="font-medium text-text-primary truncate">{target.name}</p>
                      <p className="text-sm text-text-secondary truncate">Artista</p>
                    </>
                  )}
                </div>
                <Play className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100" />
              </Button>
            </div>
          )}

          {/* Inline play button for listening activity */}
          {action === 'listening' && target && compact && (
            <Button
              variant="primary"
              size="sm"
              className="mt-2 gap-2"
              onClick={() => { /* play target */ }}
            >
              <Play className="w-4 h-4" />
              Ouvir agora
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ContentFeedItem({
  content,
  compact,
}: {
  content: FeedItemProps['content'];
  compact: boolean;
}) {
  const { play, addToQueue } = usePlayerStore();

  const handlePlay = () => {
    if (content.type === 'track' || content.type === 'episode') {
      play({ type: 'track', trackId: content.id });
    } else if (content.type === 'album') {
      play({ type: 'album', albumId: content.id });
    } else if (content.type === 'playlist') {
      play({ type: 'playlist', playlistId: content.id });
    }
  };

  const handleAddToQueue = () => {
    if (content.type === 'track' || content.type === 'episode') {
      addToQueue([{ id: content.id, title: content.title, artist: content.artist || '', album: '', duration: content.duration || 0, coverUrl: content.coverUrl, streamUrl: '', source: content.source || 'local' }]);
    }
  };

  const getTypeIcon = () => {
    switch (content.type) {
      case 'track': return <Music className="w-4 h-4" />;
      case 'album': return <Film className="w-4 h-4" />;
      case 'playlist': return <Film className="w-4 h-4" />;
      case 'artist': return <Users className="w-4 h-4" />;
      case 'show': return <Mic className="w-4 h-4" />;
      case 'episode': return <Mic className="w-4 h-4" />;
    }
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case 'track': return 'Faixa';
      case 'album': return 'Álbum';
      case 'playlist': return 'Playlist';
      case 'artist': return 'Artista';
      case 'show': return 'Podcast';
      case 'episode': return 'Episódio';
    }
  };

  return (
    <div className={cn(
      'group relative p-4 rounded-xl',
      'hover:bg-background-tertiary transition-colors',
      compact && 'py-3'
    )}>
      <div className="flex gap-3">
        {/* Cover */}
        <div className={cn('flex-shrink-0 relative rounded-lg overflow-hidden', compact ? 'w-12 h-12' : 'w-16 h-16')}>
          <img src={content.coverUrl} alt={content.title} className="w-full h-full object-cover" />
          {!compact && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="icon" variant="primary" onClick={handlePlay} className="scale-95 hover:scale-100 transition-transform">
                <Play className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('font-medium text-text-primary truncate', compact && 'text-sm')}>
              {content.title}
            </span>
            {content.explicit && <Badge variant="ghost" size="sm">E</Badge>}
            {content.source && <Badge variant="ghost" size="sm" className="text-[10px]">{content.source.toUpperCase()}</Badge>}
          </div>

          <p className={cn('text-text-secondary truncate', compact && 'text-xs')}>
            {content.artist || content.subtitle || getTypeLabel()}
          </p>

          {content.releaseDate && (
            <p className={cn('text-text-muted truncate', compact && 'text-xs')}>
              {content.type === 'track' || content.type === 'episode'
                ? `Lançado em ${new Date(content.releaseDate).toLocaleDateString('pt-BR')}`
                : `Lançado em ${new Date(content.releaseDate).toLocaleDateString('pt-BR')}`}
            </p>
          )}

          {content.duration && (
            <p className={cn('text-text-muted', compact && 'text-xs')}>
              <Clock className="w-3.5 h-3.5 inline" />
              {formatDuration(content.duration)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {content.type === 'track' || content.type === 'episode' ? (
            <>
              <Button size="icon" variant="ghost" onClick={handleAddToQueue} aria-label="Adicionar à fila">
                <Plus className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button size="icon" variant="ghost" onClick={handlePlay} aria-label="Reproduzir">
              <Play className="w-4 h-4" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {content.type === 'track' || content.type === 'episode' ? (
                <>
                  <DropdownMenuItem onClick={handlePlay}>Reproduzir</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddToQueue}>Adicionar à fila</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={handlePlay}>Reproduzir</DropdownMenuItem>
              )}
              <DropdownMenuItem>Salvar na biblioteca</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Compartilhar</DropdownMenuItem>
              <DropdownMenuItem>Copiar link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

import { Plus } from 'lucide-react';