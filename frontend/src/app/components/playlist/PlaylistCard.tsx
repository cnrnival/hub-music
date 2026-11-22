/**
 * Hub Music - PlaylistCard
 * Card de playlist para visualização em grade
 * Playlist card for grid view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatNumber } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, ListMusic, Heart as HeartIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';
import { usePlayerStore } from '../../../state/playerStore';

interface PlaylistCardProps {
  playlist: any;
  onPlay?: () => void;
  onClick?: () => void;
}

export function PlaylistCard({ playlist, onPlay, onClick }: PlaylistCardProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target || e.target.closest('button')) return;
    onClick?.();
  };

  // Generate composite cover from first 4 tracks or use playlist cover
  const coverImages = playlist.tracks?.slice(0, 4).map((t: any) => t.track?.coverUrl || t.coverUrl).filter(Boolean) || [];
  const hasCompositeCover = coverImages.length > 0;
  const useComposite = hasCompositeCover && !playlist.coverUrl;

  return (
    <article className="card-interactive group" onClick={handleClick} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {/* Cover */}
      <div className="relative aspect-square rounded-xl overflow-hidden">
        {useComposite ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
            {coverImages.slice(0, 4).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            ))}
          </div>
        ) : playlist.coverUrl ? (
          <img
            src={playlist.coverUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <ListMusic className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handlePlayClick}
            className="w-14 h-14 rounded-full bg-primary text-white shadow-glow hover:shadow-glow-lg transition-all"
            aria-label="Reproduzir playlist"
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        </div>

        {/* Visibility badge */}
        <div className="absolute top-2 left-2">
          <Badge variant={playlist.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-xs">
            {playlist.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
          </Badge>
        </div>

        {/* Track count badge */}
        <div className="absolute bottom-2 right-2">
          <Badge variant="secondary" className="text-xs">
            <ListMusic className="w-3 h-3 mr-1" />
            {playlist._count?.tracks || 0} faixas
          </Badge>
        </div>
      </div>

      {/* Playlist Info */}
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-text-primary truncate">{playlist.name}</h3>
        {playlist.user && (
          <p className="text-text-secondary text-sm truncate flex items-center gap-1">
            <Avatar src={playlist.user.avatarUrl} name={playlist.user.displayName || playlist.user.username} size="xs" />
            {playlist.user.displayName || playlist.user.username}
          </p>
        )}
        {playlist.description && (
          <p className="text-text-muted text-sm line-clamp-2">{playlist.description}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-text-muted text-[11px] pt-1">
          <span className="flex items-center gap-1">
            <HeartIcon className="w-3 h-3" />
            {formatNumber(playlist._count?.followers || 0)}
          </span>
          <span className="flex items-center gap-1">
            <ListMusic className="w-3 h-3" />
            {playlist._count?.tracks || 0}
          </span>
        </div>
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

import { ListMusic, Heart, Edit, Trash2 } from 'lucide-react';