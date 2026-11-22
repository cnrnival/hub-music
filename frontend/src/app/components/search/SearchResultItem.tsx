/**
 * Hub Music - SearchResultItem
 * Item de resultado de busca unificado
 * Unified search result item
 *
 * @languages pt-BR / en-US
 */

import { Play, Heart, Plus, MoreHorizontal, Clock, Music, Users, Film, Mic, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration, formatCount } from '@/lib/utils';
import { Button } from '@/ui/button';
import { Badge } from '@/common/Badge';
import { Avatar } from '@/common/Avatar';
import { DropdownMenu } from '@/common/DropdownMenu';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';

type SearchResultType = 'track' | 'artist' | 'album' | 'playlist' | 'show' | 'episode';

interface SearchResultItemProps {
  type: SearchResultType;
  data: any;
  index?: number;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onLike?: () => void;
  onFollow?: () => void;
}

export function SearchResultItem({
  type,
  data,
  index,
  variant = 'default',
  onPlay,
  onAddToQueue,
  onLike,
  onFollow,
}: SearchResultItemProps) {
  const { play, addToQueue } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  const handlePlay = () => {
    onPlay?.();
    switch (type) {
      case 'track':
        if (data.streamUrl) {
          play({ type: 'track', trackId: data.id });
        }
        break;
      case 'album':
        play({ type: 'album', albumId: data.id });
        break;
      case 'playlist':
        play({ type: 'playlist', playlistId: data.id });
        break;
      case 'artist':
        play({ type: 'artist', artistId: data.id });
        break;
      case 'episode':
        play({ type: 'track', trackId: data.id });
        break;
    }
  };

  const handleAddToQueue = () => {
    onAddToQueue?.();
    if (type === 'track' || type === 'episode') {
      addToQueue([{ ...data, source: data.source || 'local' }]);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'track':
        return <TrackResult data={data} index={index} onPlay={handlePlay} onAddToQueue={handleAddToQueue} onLike={onLike} variant={variant} />;
      case 'artist':
        return <ArtistResult data={data} onPlay={handlePlay} onFollow={onFollow} variant={variant} />;
      case 'album':
        return <AlbumResult data={data} onPlay={handlePlay} variant={variant} />;
      case 'playlist':
        return <PlaylistResult data={data} onPlay={handlePlay} variant={variant} />;
      case 'show':
        return <ShowResult data={data} onPlay={handlePlay} onFollow={onFollow} variant={variant} />;
      case 'episode':
        return <EpisodeResult data={data} onPlay={handlePlay} onAddToQueue={handleAddToQueue} variant={variant} />;
      default:
        return null;
    }
  };

  return <div className="w-full">{renderContent()}</div>;
}

// Track Result
function TrackResult({
  data,
  index,
  onPlay,
  onAddToQueue,
  onLike,
  variant,
}: {
  data: any;
  index?: number;
  onPlay: () => void;
  onAddToQueue: () => void;
  onLike?: () => void;
  variant: 'default' | 'compact';
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      {/* Number/Play */}
      <div className={cn('flex-shrink-0 w-10 text-center text-text-muted', isCompact && 'w-8')}>
        {index !== undefined && !isCompact ? (
          <span className="text-sm">{index + 1}</span>
        ) : (
          <Button size="icon" variant="ghost" onClick={onPlay} className="text-primary opacity-0 group-hover:opacity-100">
            <Play className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Cover */}
      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn('font-medium text-text-primary truncate', isCompact && 'text-sm')}>
            {data.title}
          </h3>
          {data.explicit && <Badge variant="ghost" size="sm">E</Badge>}
          {data.source && <Badge variant="ghost" size="sm" className="text-[10px]">{data.source.toUpperCase()}</Badge>}
        </div>
        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
          {data.artist}{data.album && ` · ${data.album}`}
        </p>
      </div>

      {/* Duration & Actions */}
      <div className="flex items-center gap-2">
        {data.duration && (
          <span className={cn('text-text-muted font-tabular-nums', isCompact && 'text-xs')}>
            {formatDuration(data.duration)}
          </span>
        )}

        {!isCompact && (
          <>
            <Button size="icon" variant="ghost" onClick={onAddToQueue} aria-label="Adicionar à fila" className="opacity-0 group-hover:opacity-100">
              <Plus className="w-4 h-4" />
            </Button>
            {onLike && (
              <Button size="icon" variant="ghost" onClick={onLike} aria-label="Curtir" className="opacity-0 group-hover:opacity-100">
                <Heart className="w-4 h-4" />
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
                <DropdownMenuItem onClick={onAddToQueue}>Adicionar à fila</DropdownMenuItem>
                <DropdownMenuItem>Adicionar à playlist</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Ir para o artista</DropdownMenuItem>
                <DropdownMenuItem>Ir para o álbum</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                <DropdownMenuItem>Copiar link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}

// Artist Result
function ArtistResult({
  data,
  onPlay,
  onFollow,
  variant,
}: {
  data: any;
  onPlay: () => void;
  onFollow?: () => void;
  variant: 'default' | 'compact';
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      <div className={cn('flex-shrink-0 rounded-full overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <Avatar src={data.avatarUrl} name={data.name} size={isCompact ? 'sm' : 'md'} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={cn('font-medium text-text-primary truncate', isCompact && 'text-sm')}>{data.name}</h3>
        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
          {data.followerCount ? `${formatCount(data.followerCount)} ouvintes` : 'Artista'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onFollow && (
          <Button size="sm" variant="outline" onClick={onFollow} className="gap-1 opacity-0 group-hover:opacity-100">
            <Users className="w-4 h-4" />
            Seguir
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={onPlay} aria-label="Reproduzir artista" className="opacity-0 group-hover:opacity-100">
          <Play className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem>Ver perfil</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Album Result
function AlbumResult({
  data,
  onPlay,
  variant,
}: {
  data: any;
  onPlay: () => void;
  variant: 'default' | 'compact';
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={cn('font-medium text-text-primary truncate', isCompact && 'text-sm')}>{data.title}</h3>
        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
          {data.artist} · {data.totalTracks} faixas
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={onPlay} aria-label="Reproduzir álbum" className="opacity-0 group-hover:opacity-100">
          <Play className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem>Salvar na biblioteca</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Playlist Result
function PlaylistResult({
  data,
  onPlay,
  variant,
}: {
  data: any;
  onPlay: () => void;
  variant: 'default' | 'compact';
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        {data.coverUrl ? (
          <img src={data.coverUrl} alt={data.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Music className="w-6 h-6 text-white/80" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={cn('font-medium text-text-primary truncate', isCompact && 'text-sm')}>{data.name}</h3>
        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
          Por {data.owner} · {data.trackCount} faixas
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={onPlay} aria-label="Reproduzir playlist" className="opacity-0 group-hover:opacity-100">
          <Play className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem>Salvar na biblioteca</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Show Result
function ShowResult({
  data,
  onPlay,
  onFollow,
  variant,
}: {
  data: any;
  onPlay: () => void;
  onFollow?: () => void;
  variant: 'default' | 'compact';
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn('font-medium text-text-primary truncate', isCompact && 'text-sm')}>{data.title}</h3>
          <Badge variant="ghost" size="sm"><Mic className="w-3 h-3 mr-1" /> Podcast</Badge>
        </div>
        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
          {data.author} · {data.totalEpisodes} episódios
        </p>
      </div>

      <div className="flex items-center gap-2">
        {onFollow && (
          <Button size="sm" variant="outline" onClick={onFollow} className="gap-1 opacity-0 group-hover:opacity-100">
            <Heart className="w-4 h-4" />
            Seguir
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={onPlay} aria-label="Reproduzir show" className="opacity-0 group-hover:opacity-100">
          <Play className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem>Seguir</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Compartilhar</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Episode Result
function EpisodeResult({
  data,
  onPlay,
  onAddToQueue,
  variant,
}: {
  data: any;
  onPlay: () => void;
  onAddToQueue: () => void;
  variant: 'default' | 'compact';
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      isCompact && 'py-1.5'
    )}>
      <div className={cn('flex-shrink-0 w-10 text-center text-text-muted', isCompact && 'w-8')}>
        <Button size="icon" variant="ghost" onClick={onPlay} className="text-primary opacity-0 group-hover:opacity-100">
          <Play className="w-4 h-4" />
        </Button>
      </div>

      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <img src={data.coverUrl} alt={data.title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn('font-medium text-text-primary truncate', isCompact && 'text-sm')}>{data.title}</h3>
          {data.explicit && <Badge variant="ghost" size="sm">E</Badge>}
        </div>
        <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>{data.show}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn('text-text-muted font-tabular-nums', isCompact && 'text-xs')}>
          {formatDuration(data.duration)}
        </span>
        {!isCompact && (
          <>
            <Button size="icon" variant="ghost" onClick={onAddToQueue} aria-label="Adicionar à fila" className="opacity-0 group-hover:opacity-100">
              <Plus className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onPlay}>Reproduzir</DropdownMenuItem>
                <DropdownMenuItem onClick={onAddToQueue}>Adicionar à fila</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Ir para o show</DropdownMenuItem>
                <DropdownMenuItem>Compartilhar</DropdownMenuItem>
                <DropdownMenuItem>Copiar link</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    </div>
  );
}