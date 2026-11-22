/**
 * Hub Music - PlaylistRow
 * Linha de playlist para visualização em lista
 * Playlist row for list view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatNumber } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, ListMusic, Heart as HeartIcon, User } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';

interface PlaylistRowProps {
  playlist: any;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onClick?: () => void;
}

export function PlaylistRow({ playlist, variant = 'default', onPlay, onClick }: PlaylistRowProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const rowClasses = cn(
    'flex items-center gap-3 p-2 rounded-xl transition-colors',
    'hover:bg-background-tertiary group',
    variant === 'compact' && 'px-1 py-1.5'
  );

  // Cover
  const coverImages = playlist.tracks?.slice(0, 4).map((t: any) => t.track?.coverUrl || t.coverUrl).filter(Boolean) || [];
  const hasCompositeCover = coverImages.length > 0;
  const useComposite = hasCompositeCover && !playlist.coverUrl;

  return (
    <div className={rowClasses} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      {/* Cover */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden">
        {useComposite ? (
          <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-0.5">
            {coverImages.slice(0, 4).map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ))}
          </div>
        ) : playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <ListMusic className="w-6 h-6 text-white/50" />
          </div>
        )}
      </div>

      {/* Playlist Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate flex-1">{playlist.name}</p>
          <Badge variant={playlist.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-[10px] px-1.5">
            {playlist.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          {playlist.user && (
            <>
              <Avatar src={playlist.user.avatarUrl} name={playlist.user.displayName || playlist.user.username} size="xs" />
              <span className="truncate">{playlist.user.displayName || playlist.user.username}</span>
            </>
          )}
          <span className="flex items-center gap-1">
            <ListMusic className="w-3 h-3" />
            {playlist._count?.tracks || 0} faixas
          </span>
          {playlist._count?.followers && (
            <span className="flex items-center gap-1">
              <HeartIcon className="w-3 h-3" />
              {formatNumber(playlist._count.followers)}
            </span>
          )}
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

import { ListMusic, Heart, Plus, Edit, Trash2 } from 'lucide-react';