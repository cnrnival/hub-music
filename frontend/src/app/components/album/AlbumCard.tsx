/**
 * Hub Music - AlbumCard
 * Card de álbum para visualização em grade
 * Album card for grid view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import { Play, Heart, MoreHorizontal, Music, Calendar } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';

interface AlbumCardProps {
  album: any;
  onPlay?: () => void;
  onClick?: () => void;
}

export function AlbumCard({ album, onPlay, onClick }: AlbumCardProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target || e.target.closest('button')) return;
    onClick?.();
  };

  const releaseDate = album.releaseDate ? new Date(album.releaseDate).getFullYear() : '—';
  const trackCount = album._count?.tracks || album.tracks?.length || 0;

  return (
    <article className="card-interactive group" onClick={handleClick} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <Music className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handlePlayClick}
            className="w-14 h-14 rounded-full bg-primary text-white shadow-glow hover:shadow-glow-lg transition-all"
            aria-label="Reproduzir álbum"
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        </div>

        {/* Explicit badge */}
        {album.explicit && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-[10px] px-1.5">
              EXPLICIT
            </Badge>
          </div>
        )}

        {/* Source badge */}
        {album.source && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-[10px] px-1.5">
              {album.source}
            </Badge>
          </div>
        )}
      </div>

      {/* Album Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-text-primary truncate">{album.title || album.name}</h3>

        {album.artist && (
          <p className="text-text-secondary text-sm truncate flex items-center gap-1">
            <Avatar src={album.artist.avatarUrl} name={album.artist.displayName || album.artist.username} size="xs" />
            {album.artist.displayName || album.artist.username}
          </p>
        )}

        <div className="flex items-center gap-2 text-text-muted text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {releaseDate}
          </span>
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {trackCount} faixas
          </span>
        </div>

        {/* Stats */}
        {album._count?.likes !== undefined && (
          <div className="flex items-center gap-2 text-text-muted text-[11px] pt-1">
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(album._count.likes)}
            </span>
          </div>
        )}
      </div>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1"
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
    </article>
  );
}

