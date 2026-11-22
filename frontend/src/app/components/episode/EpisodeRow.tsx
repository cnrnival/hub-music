/**
 * Hub Music - EpisodeRow
 * Linha de episódio para listas
 * Episode row for lists
 *
 * @languages pt-BR / en-US
 */

import { Play, Heart, Plus, MoreHorizontal, Clock, Mic, Check, Download } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatDuration, formatDate } from '../../../lib/utils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/common/Badge';
import { DropdownMenu } from '../../components/common/DropdownMenu';
import { usePlayerStore } from '../../../state/playerStore';
import { useUIStore } from '../../../state/uiStore';

interface Episode {
  id: string;
  title: string;
  show: {
    id: string;
    title: string;
    coverUrl: string;
  };
  coverUrl: string;
  audioUrl: string;
  duration: number;
  releaseDate: string;
  episodeNumber: number;
  seasonNumber?: number;
  explicit: boolean;
  isPlayed: boolean;
  playProgress: number;
  isSaved: boolean;
  isDownloaded: boolean;
}

interface EpisodeRowProps {
  episode: Episode;
  index?: number;
  onPlay?: () => void;
  onAddToQueue?: () => void;
  onSave?: () => void;
  onDownload?: () => void;
  variant?: 'default' | 'compact';
  showShowInfo?: boolean;
}

export function EpisodeRow({
  episode,
  index,
  onPlay,
  onAddToQueue,
  onSave,
  onDownload,
  variant = 'default',
  showShowInfo = true,
}: EpisodeRowProps) {
  const { play, addToQueue } = usePlayerStore();
  const { toggleQueuePanel } = useUIStore();

  const handlePlay = () => {
    onPlay?.();
    play({ type: 'track', trackId: episode.id });
  };

  const handleAddToQueue = () => {
    onAddToQueue?.();
    addToQueue([{
      id: episode.id,
      title: episode.title,
      artist: episode.show.title,
      album: episode.show.title,
      duration: episode.duration,
      coverUrl: episode.coverUrl,
      streamUrl: episode.audioUrl,
      source: 'local',
    }]);
  };

  const handleSave = () => {
    onSave?.();
    // TODO: Implement save
  };

  const handleDownload = () => {
    onDownload?.();
    // TODO: Implement download
  };

  const isCompact = variant === 'compact';

  return (
    <div className={cn(
      'group flex items-center gap-3 p-2 rounded-lg',
      'hover:bg-background-tertiary transition-colors',
      episode.isPlayed && 'opacity-60',
      isCompact && 'py-1.5'
    )}>
      {/* Play/Number/Progress */}
      <div className={cn('flex-shrink-0 w-12 text-center text-text-muted', isCompact && 'w-8')}>
        {episode.playProgress > 0 && episode.playProgress < 100 ? (
          <div className="w-6 h-6 rounded-full border border-primary/30 relative mx-auto">
            <div
              className="absolute inset-0 rounded-full bg-primary/20"
              style={{
                clipPath: `polygon(0 0, ${episode.playProgress}% 0, ${episode.playProgress}% 100%, 0 100%)`
              }}
            />
          </div>
        ) : episode.isPlayed ? (
          <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center mx-auto">
            <Check className="w-4 h-4 text-success" />
          </div>
        ) : index !== undefined && !isCompact ? (
          <span className="text-sm">{index + 1}</span>
        ) : (
          <Button size="icon" variant="ghost" onClick={handlePlay} className="text-primary opacity-0 group-hover:opacity-100">
            <Play className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Cover */}
      <div className={cn('flex-shrink-0 rounded-lg overflow-hidden', isCompact ? 'w-10 h-10' : 'w-12 h-12')}>
        <img src={episode.coverUrl} alt={episode.title} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className={cn('font-medium text-text-primary truncate pr-4', isCompact && 'text-sm')}>
            {episode.title}
          </h3>
          {episode.explicit && <Badge variant="ghost" size="sm">E</Badge>}
        </div>

        {showShowInfo && (
          <p className={cn('text-text-secondary truncate', isCompact && 'text-xs')}>
            {episode.show.title}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
          {episode.seasonNumber && (
            <span>T{episode.seasonNumber} Ep.{episode.episodeNumber}</span>
          )}
          {!episode.seasonNumber && (
            <span>Ep. {episode.episodeNumber}</span>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(episode.duration)}
          </span>
          <span>•</span>
          <span>{formatDate(episode.releaseDate)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={handleAddToQueue} aria-label="Adicionar à fila">
          <Plus className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleSave} aria-label={episode.isSaved ? 'Remover da biblioteca' : 'Salvar'}>
          <Heart className={cn('w-4 h-4', episode.isSaved ? 'fill-current text-primary' : '')} />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDownload} aria-label={episode.isDownloaded ? 'Remover download' : 'Baixar'}>
          <Download className={cn('w-4 h-4', episode.isDownloaded ? 'text-primary' : '')} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handlePlay}>Reproduzir</DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddToQueue}>Adicionar à fila</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSave}>
              {episode.isSaved ? 'Remover da biblioteca' : 'Salvar na biblioteca'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              {episode.isDownloaded ? 'Remover download' : 'Baixar'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Ir para o show</DropdownMenuItem>
            <DropdownMenuItem>Compartilhar episódio</DropdownMenuItem>
            <DropdownMenuItem>Copiar link</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}