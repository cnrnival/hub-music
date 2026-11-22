/**
 * Hub Music - ChipsRow
 * Linha de chips/filtros horizontais (Gêneros, Humores, Décadas, Atividades)
 * Horizontal chips/filters row (Genres, Moods, Decades, Activities)
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';

interface Chip {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  selected?: boolean;
}

interface ChipsRowProps {
  title: string;
  chips: Chip[];
  onChipClick?: (chip: Chip) => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
}

export function ChipsRow({
  title,
  chips,
  onChipClick,
  showSeeAll = false,
  onSeeAll,
  scrollRef,
}: ChipsRowProps) {
  return (
    <section className="py-4" ref={scrollRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-semibold text-text-primary text-lg">{title}</h2>
        {(showSeeAll || onSeeAll) && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-text-secondary hover:text-primary"
            onClick={onSeeAll}
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Chips Scroll */}
      <ScrollArea className="h-auto" type="always">
        <div className="flex gap-2 px-4 pb-2" role="list" aria-label={title}>
          {chips.map((chip) => (
            <button
              key={chip.id}
              role="listitem"
              onClick={() => onChipClick?.(chip)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200',
                'whitespace-nowrap shrink-0',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                chip.selected
                  ? 'bg-primary text-white shadow-glow'
                  : 'bg-background-tertiary text-text-secondary hover:bg-background-hover hover:text-text-primary'
              )}
              aria-pressed={chip.selected}
              aria-label={chip.label}
            >
              {chip.icon && <span className="flex-shrink-0">{chip.icon}</span>}
              <span className="font-medium text-sm">{chip.label}</span>
              {chip.count !== undefined && (
                <span className={cn(
                  'text-[11px] px-1.5 py-0.5 rounded-full',
                  chip.selected ? 'bg-white/20' : 'bg-background-secondary'
                )}>
                  {chip.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </section>
  );
}

// Predefined chip categories
export const genreChips: Chip[] = [
  { id: 'pop', label: 'Pop', icon: <Music className="w-4 h-4" /> },
  { id: 'hiphop', label: 'Hip Hop', icon: <Mic className="w-4 h-4" /> },
  { id: 'rock', label: 'Rock', icon: <Guitar className="w-4 h-4" /> },
  { id: 'electronic', label: 'Eletrônica', icon: <Zap className="w-4 h-4" /> },
  { id: 'rnb', label: 'R&B', icon: <Heart className="w-4 h-4" /> },
  { id: 'latin', label: 'Latina', icon: <Globe className="w-4 h-4" /> },
  { id: 'indie', label: 'Indie', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'kpop', label: 'K-Pop', icon: <Star className="w-4 h-4" /> },
  { id: 'funk', label: 'Funk', icon: <Volume2 className="w-4 h-4" /> },
  { id: 'sertanejo', label: 'Sertanejo', icon: <HatCowboy className="w-4 h-4" /> },
  { id: 'mpb', label: 'MPB', icon: <Music2 className="w-4 h-4" /> },
  { id: 'classical', label: 'Clássica', icon: <Music3 className="w-4 h-4" /> },
];

export const moodChips: Chip[] = [
  { id: 'chill', label: 'Relaxar', icon: <Coffee className="w-4 h-4" /> },
  { id: 'workout', label: 'Treino', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'focus', label: 'Foco', icon: <Brain className="w-4 h-4" /> },
  { id: 'party', label: 'Festa', icon: <GlassWater className="w-4 h-4" /> },
  { id: 'sleep', label: 'Dormir', icon: <Moon className="w-4 h-4" /> },
  { id: 'roadtrip', label: 'Viagem', icon: <Car className="w-4 h-4" /> },
  { id: 'romance', label: 'Romance', icon: <Heart className="w-4 h-4" /> },
  { id: 'energy', label: 'Energia', icon: <Zap className="w-4 h-4" /> },
  { id: 'nostalgia', label: 'Nostalgia', icon: <Clock className="w-4 h-4" /> },
  { id: 'discover', label: 'Descobrir', icon: <Compass className="w-4 h-4" /> },
];

export const decadeChips: Chip[] = [
  { id: '2020s', label: '2020s' },
  { id: '2010s', label: '2010s' },
  { id: '2000s', label: '2000s' },
  { id: '1990s', label: '1990s' },
  { id: '1980s', label: '1980s' },
  { id: '1970s', label: '1970s' },
  { id: '1960s', label: '1960s' },
  { id: 'older', label: 'Antigos' },
];

export const activityChips: Chip[] = [
  { id: 'made-for-you', label: 'Feito para você' },
  { id: 'daily-mix', label: 'Daily Mix' },
  { id: 'discover-weekly', label: 'Descobertas da semana' },
  { id: 'release-radar', label: 'Radar de lançamentos' },
  { id: 'on-repeat', label: 'Em repeat' },
  { id: 'repeat-rewind', label: 'Rebobinar' },
  { id: 'your-top-songs', label: 'Suas top músicas' },
  { id: 'time-capsule', label: 'Cápsula do tempo' },
];

import { Music, Mic, Guitar, Zap, Heart, Globe, Sparkles, Star, Volume2, HatCowboy, Music2, Music3, Coffee, Dumbbell, Brain, GlassWater, Moon, Car, Compass, Clock, Download, Radio, Share2, Plus, Edit, Trash2, Check } from 'lucide-react';