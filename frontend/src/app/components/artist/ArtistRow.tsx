/**
 * Hub Music - ArtistRow
 * Linha de artista para visualização em lista
 * Artist row for list view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatNumber } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, User, UserPlus, UserCheck, Music, Heart as HeartIcon, Check } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';

interface ArtistRowProps {
  artist: any;
  variant?: 'default' | 'compact';
  onPlay?: () => void;
  onClick?: () => void;
}

export function ArtistRow({ artist, variant = 'default', onPlay, onClick }: ArtistRowProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const rowClasses = cn(
    'flex items-center gap-3 p-2 rounded-xl transition-colors',
    'hover:bg-background-tertiary group',
    variant === 'compact' && 'px-1 py-1.5'
  );

  return (
    <div className={rowClasses} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick?.())}>
      {/* Avatar */}
      <div className="relative w-12 h-12 flex-shrink-0 rounded-full overflow-hidden">
        {artist.avatarUrl ? (
          <img src={artist.avatarUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <User className="w-6 h-6 text-white/50" />
          </div>
        )}
        {artist.verified && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{artist.displayName || artist.username}</p>
        <p className="text-text-secondary text-sm truncate">
          {formatNumber(artist._count?.followers || 0)} ouvintes
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => { e.stopPropagation(); }}
          className="gap-1"
        >
          {artist.isFollowing ? (
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
            <Button variant="ghost" size="icon" className="p-1" onClick={(e) => e.stopPropagation()} aria-label="Mais opções">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onPlay}>
              <Play className="w-4 h-4 mr-2" /> Reproduzir top músicas
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Heart className="w-4 h-4 mr-2" /> Salvar na biblioteca
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

import { User, Check, Share2, UserPlus, UserCheck } from 'lucide-react';