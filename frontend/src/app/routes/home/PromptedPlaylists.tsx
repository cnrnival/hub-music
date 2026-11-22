/**
 * Hub Music - PromptedPlaylists
 * Playlists algorítmicas (Por Gênero, Por Humor, Por Artista)
 * Algorithmic playlists (By Genre, By Mood, By Artist)
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';
import { Play, Heart, MoreHorizontal, ChevronRight, Sparkles, Shuffle } from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { ScrollArea } from '@/ui/scroll-area';
import { PlaylistCard } from '@/components/playlist/PlaylistCard';
import { usePlayerStore } from '@/state/playerStore';

interface PromptedPlaylist {
  id: string;
  prompt: string;
  playlists: any[];
  icon?: React.ReactNode;
}

interface PromptedPlaylistsProps {
  title: string;
  prompts: PromptedPlaylist[];
  onPlaylistClick?: (playlist: any) => void;
  onPlayClick?: (playlist: any) => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export function PromptedPlaylists({
  title,
  prompts,
  onPlaylistClick,
  onPlayClick,
  showSeeAll = true,
  onSeeAll,
}: PromptedPlaylistsProps) {
  const { play } = usePlayerStore();

  const handlePlayClick = (playlist: any, e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayClick?.(playlist);
    play({ type: 'playlist', playlistId: playlist.id });
  };

  if (prompts.length === 0) {
    return (
      <section className="py-4">
        <div className="flex items-center justify-between px-4 mb-3">
          <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {title}
          </h2>
          {showSeeAll && onSeeAll && (
            <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
        <div className="px-4 py-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-background-tertiary rounded-xl flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-text-muted" />
          </div>
          <p className="text-text-secondary">Nenhuma playlist sugerida no momento</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="font-semibold text-text-primary text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {title}
        </h2>
        {showSeeAll && onSeeAll && (
          <Button variant="ghost" size="sm" className="gap-1 text-text-secondary hover:text-primary" onClick={onSeeAll}>
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Prompts */}
      <div className="space-y-6 px-4">
        {prompts.map((promptGroup) => (
          <div key={promptGroup.id} className="space-y-3">
            {/* Prompt Label */}
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              {promptGroup.icon && <span>{promptGroup.icon}</span>}
              <span className="font-medium text-text-primary">{promptGroup.prompt}</span>
            </div>

            {/* Playlist Carousel */}
            <ScrollArea className="h-auto" type="always">
              <div className="flex gap-3 pb-2" role="list" aria-label={promptGroup.prompt}>
                {promptGroup.playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="flex-shrink-0 w-40 md:w-44 lg:w-48"
                    role="listitem"
                  >
                    <PlaylistCard
                      playlist={playlist}
                      onPlay={() => handlePlayClick(playlist, e as any)}
                      onClick={() => onPlaylistClick?.(playlist)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ))}
      </div>
    </section>
  );
}

// Helper to create prompted playlists from categories
export function createPromptedPlaylists(
  category: 'genre' | 'mood' | 'artist',
  data: Record<string, any[]>
): PromptedPlaylist[] {
  return Object.entries(data).map(([prompt, playlists]) => ({
    id: `${category}-${prompt}`,
    prompt: prompt.charAt(0).toUpperCase() + prompt.slice(1),
    playlists,
    icon: category === 'genre' ? <Music className="w-4 h-4" /> :
          category === 'mood' ? <Heart className="w-4 h-4" /> :
          <User className="w-4 h-4" />,
  }));
}

import { ChevronRight, Music, Heart, User, Sparkles, Shuffle, Play, MoreHorizontal, Share2, Plus, Download, Radio } from 'lucide-react';export default PromptedPlaylists;
