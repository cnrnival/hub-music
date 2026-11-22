/**
 * Hub Music - ArtistCard
 * Card de artista para visualização em grade
 * Artist card for grid view
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { formatNumber } from '../../../lib/utils';
import { Play, Heart, MoreHorizontal, User, UserPlus, Music, Heart as HeartIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar } from '../../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../ui/dropdown-menu';

interface ArtistCardProps {
  artist: any;
  onPlay?: () => void;
  onClick?: () => void;
}

export function ArtistCard({ artist, onPlay, onClick }: ArtistCardProps) {
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target || e.target.closest('button')) return;
    onClick?.();
  };

  return (
    <article className="card-interactive group" onClick={handleClick} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onClick?.())}>
      {/* Avatar */}
      <div className="relative aspect-square rounded-full overflow-hidden mb-3">
        {artist.avatarUrl ? (
          <img
            src={artist.avatarUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <User className="w-12 h-12 text-white/50" />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            onClick={handlePlayClick}
            className="w-12 h-12 rounded-full bg-primary text-white shadow-glow hover:shadow-glow-lg transition-all"
            aria-label="Reproduzir artista"
          >
            <Play className="w-5 h-5 ml-1" />
          </Button>
        </div>

        {/* Verified badge */}
        {artist.verified && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="primary" className="text-[10px] px-1.5">
              <Check className="w-3 h-3 mr-1" />
              Verificado
            </Badge>
          </div>
        )}
      </div>

      {/* Artist Info */}
      <div className="space-y-1 text-center">
        <h3 className="font-medium text-text-primary truncate">{artist.displayName || artist.username}</h3>
        {artist._count?.followers !== undefined && (
          <p className="text-text-secondary text-sm">
            {formatNumber(artist._count.followers)} ouvintes
          )}
        )}

        {/* Actions */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <UserPlus className="w-4 h-4" />
            Seguir
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
            </DropdownMenuContent          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}

import { User, Check, Share2 } from 'lucide-react';