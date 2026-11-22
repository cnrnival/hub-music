/**
 * Hub Music - AlbumRow
 * Linha de álbum para visualização em lista
 * Album row for list view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatNumber } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, Music, Calendar } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';

interface AlbumRowProps {
  album: any;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onClick?: () => void;
}

export function AlbumRow({ album, variant = 'default', onPlay, onClick }: AlbumRowProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const rowClasses = cn(
    'flex items-center gap-3 p-2 rounded-xl transition-colors',
    'hover:bg-background-tertiary group',
    variant === 'compact' && 'px-1 py-1.5'
  );

  const releaseDate = album.releaseDate ? new Date(album.releaseDate).getFullYear() : '—';
  const trackCount = album._count?.tracks || album.tracks?.length || 0;

  return (
    <div className={rowClasses} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.())}>
      {/* Cover */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <Music className="w-6 h-6 text-white/50" />
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{album.title || album.name}</p>
        <div className="flex items-center gap-2 text-text-secondary text-sm flex-wrap">
          {album.artist && (
            <>
              <Avatar src={album.artist.avatarUrl} name={album.artist.displayName || album.artist.username} size="xs" />
              <span className="truncate">{album.artist.displayName || album.artist.username}</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {releaseDate}
          </span>
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {trackCount} faixas
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlayClick}
          className="text-text-secondary hover:text-primary"
          aria-label="Reproduzir"
        >
          <Play className="w-5 h-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mais opções"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>
              <Play className="w-4 h-4 mr-2" /> Reproduzir
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Heart className="w-4 h-4 mr-2" /> Salvar na biblioteca
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Plus className="w-4 h-4 mr-2" /> Adicionar à fila
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-error">
              <Trash2 className="w-4 h-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

import { Heart, Plus, Share2, Edit, Trash2 } from 'lucide-react';