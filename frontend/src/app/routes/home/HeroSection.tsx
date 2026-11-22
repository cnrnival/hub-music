/**
 * Hub Music - HeroSection
 * Seção hero da home com destaque para playlist/álbum/artista
 * Hero section for home with featured playlist/album/artist
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';
import { Play, Heart, MoreHorizontal, ChevronRight } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { usePlayerStore } from '@/state/playerStore';

interface HeroSectionProps {
  item: {
    id: string;
    type: 'playlist' | 'album' | 'artist';
    title: string;
    subtitle?: string;
    description?: string;
    coverUrl?: string;
    owner?: {
      id: string;
      displayName: string;
      username: string;
      avatarUrl?: string;
      verified?: boolean;
    };
    _count?: {
      tracks?: number;
      followers?: number;
    };
    source?: string;
    explicit?: boolean;
  };
  onPlay?: () => void;
  onClick?: () => void;
}

export function HeroSection({ item, onPlay, onClick }: HeroSectionProps) {
  const { play } = usePlayerStore();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.();
    play({ type: item.type, [item.type + 'Id']: item.id });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target || e.target.closest('button')) return;
    onClick?.();
  };

  const getItemIcon = () => {
    switch (item.type) {
      case 'playlist': return <ListMusic className="w-6 h-6" />;
      case 'album': return <Music className="w-6 h-6" />;
      case 'artist': return <User className="w-6 h-6" />;
      default: return <Music className="w-6 h-6" />;
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background-secondary to-background-tertiary p-6 md:p-8 lg:p-12" onClick={handleClick}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-primary-dark/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
        {/* Cover Art */}
        <div className="relative flex-shrink-0 w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 rounded-xl overflow-hidden shadow-2xl">
          {item.coverUrl ? (
            <img
              src={item.coverUrl}
              alt=""
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
              {getItemIcon()}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <Badge variant="primary" className="text-[10px] px-2 py-0.5">
              {item.type === 'playlist' ? 'Playlist' : item.type === 'album' ? 'Álbum' : 'Artista'}
            </Badge>
            {item.source && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                {item.source}
              </Badge>
            )}
            {item.explicit && (
              <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                EXPLICIT
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 min-w-0 text-center md:text-left">
          {/* Owner */}
          {item.owner && (
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Avatar src={item.owner.avatarUrl} name={item.owner.displayName || item.owner.username} size="sm" />
              <span className="text-text-secondary text-sm font-medium">
                {item.owner.displayName || item.owner.username}
                {item.owner.verified && <Check className="w-3 h-3 ml-1 text-primary inline-block" />}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary truncate mb-2">
            {item.title}
          </h1>

          {/* Subtitle */}
          {item.subtitle && (
            <p className="text-text-secondary text-lg md:text-xl mb-4 truncate">{item.subtitle}</p>
          )}

          {/* Stats */}
          <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 mb-6 text-text-muted text-sm">
            {item._count?.tracks !== undefined && (
              <span className="flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                {item._count.tracks} faixas
              </span>
            )}
            {item._count?.followers !== undefined && (
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                {item._count.followers} curtidas
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-text-secondary text-base md:text-lg mb-6 line-clamp-3 max-w-2xl mx-auto md:mx-0">
              {item.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
            <Button
              onClick={handlePlayClick}
              size="lg"
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-white shadow-glow hover:shadow-glow-lg"
              aria-label="Reproduzir"
            >
              <Play className="w-5 h-5" />
              Reproduzir
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2"
              onClick={(e) => { e.stopPropagation(); }}
            >
              <Heart className="w-5 h-5" />
              Salvar
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="lg" className="w-full sm:w-auto p-3" onClick={(e) => e.stopPropagation()} aria-label="Mais opções">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePlayClick}>
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
                  <Download className="w-4 h-4 mr-2" /> Baixar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Radio className="w-4 h-4 mr-2" /> Ir para rádio do artista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </section>
  );
}

import { ListMusic, Music, User, Check, Share2, Plus, Download, Radio } from 'lucide-react';export default HeroSection;
