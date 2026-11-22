/**
 * Hub Music - Carousel
 * Carrossel horizontal com scroll snap e navegação por teclado
 * Horizontal carousel with scroll snap and keyboard navigation
 *
 * @languages pt-BR / en-US
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../components/ui/button';

interface CarouselProps<T> {
  items: T[];
  children: (item: T, index: number) => React.ReactNode;
  itemWidth?: number;
  gap?: number;
  showArrows?: boolean;
  autoScroll?: boolean;
  autoScrollInterval?: number;
  pauseOnHover?: boolean;
  className?: string;
  contentClassName?: string;
  onScrollEnd?: () => void;
}

export function Carousel<T>({
  items,
  children,
  itemWidth = 280,
  gap = 16,
  showArrows = true,
  autoScroll = false,
  autoScrollInterval = 5000,
  pauseOnHover = true,
  className,
  contentClassName,
  onScrollEnd,
}: CarouselProps<T>) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<number>();
  const dragStartRef = useRef({ x: 0, scrollLeft: 0 });

  // Update arrow visibility
  const updateArrows = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    setScrollPosition(scrollLeft);
  }, []);

  // Scroll to index
  const scrollToIndex = useCallback((index: number) => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const itemElement = content.children[index] as HTMLElement;
    if (!itemElement) return;

    const targetScroll = itemElement.offsetLeft - (container.clientWidth - itemWidth) / 2;
    container.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
  }, [itemWidth]);

  // Next/Previous
  const scrollNext = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = itemWidth + gap;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }, [itemWidth, gap]);

  const scrollPrev = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = itemWidth + gap;
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  }, [itemWidth, gap]);

  // Handle scroll
  const handleScroll = useCallback(() => {
    updateArrows();
  }, [updateArrows]);

  // Drag handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      scrollLeft: container.scrollLeft,
    };
    container.style.scrollBehavior = 'auto';
    container.style.cursor = 'grabbing';
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const dx = e.clientX - dragStartRef.current.x;
    container.scrollLeft = dragStartRef.current.scrollLeft - dx;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.scrollBehavior = 'smooth';
      container.style.cursor = 'grab';
    }
  }, [isDragging]);

  // Keyboard navigation
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollNext();
      } else if (e.key === 'Home') {
        e.preventDefault();
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        e.preventDefault();
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [scrollPrev, scrollNext]);

  // Auto scroll
  useEffect(() => {
    if (!autoScroll) return;

    const startAutoScroll = () => {
      autoScrollTimerRef.current = window.setInterval(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          // Reached end, scroll back to start
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollNext();
        }
      }, autoScrollInterval);
    };

    const stopAutoScroll = () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };

    if (pauseOnHover) {
      const container = scrollContainerRef.current;
      container?.addEventListener('mouseenter', stopAutoScroll);
      container?.addEventListener('mouseleave', startAutoScroll);
    }

    startAutoScroll();
    return () => {
      stopAutoScroll();
      const container = scrollContainerRef.current;
      container?.removeEventListener('mouseenter', stopAutoScroll);
      container?.removeEventListener('mouseleave', startAutoScroll);
    };
  }, [autoScroll, autoScrollInterval, pauseOnHover, scrollNext]);

  // Update arrows on resize
  useEffect(() => {
    updateArrows();
    const handleResize = () => updateArrows();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateArrows, items.length]);

  if (items.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      {/* Left Arrow */}
      {showArrows && showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 z-10',
            'bg-background-secondary/80 backdrop-blur-sm',
            'rounded-full shadow-lg',
            'hover:bg-background-secondary',
            'transition-all duration-200',
            'lg:opacity-0 lg:group-hover:opacity-100'
          )}
          onClick={scrollPrev}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex overflow-x-auto',
          'scrollbar-hide',
          'scroll-smooth',
          'touch-pan-x',
          'group'
        )}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        tabIndex={0}
        role="region"
        aria-label="Carrossel"
      >
        <div
          ref={contentRef}
          className={cn('flex gap-4 pb-4', contentClassName)}
          style={{ gap }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{ width: itemWidth }}
            >
              {children(item, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      {showArrows && showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute right-0 top-1/2 -translate-y-1/2 z-10',
            'bg-background-secondary/80 backdrop-blur-sm',
            'rounded-full shadow-lg',
            'hover:bg-background-secondary',
            'transition-all duration-200',
            'lg:opacity-0 lg:group-hover:opacity-100'
          )}
          onClick={scrollNext}
          aria-label="Próximo"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      )}

      {/* Scroll indicator dots */}
      {items.length <= 10 && (
        <div className="flex justify-center gap-1 mt-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                scrollPosition > (index - 0.5) * (itemWidth + gap) &&
                scrollPosition < (index + 0.5) * (itemWidth + gap)
                  ? 'bg-primary w-6'
                  : 'bg-border-primary hover:bg-text-muted'
              )}
              aria-label={`Ir para item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Specialized carousels for common use cases
export function TrackCarousel({ tracks, ...props }: { tracks: any[] } & Omit<CarouselProps<any>, 'items' | 'children'>) {
  return (
    <Carousel
      items={tracks}
      itemWidth={160}
      {...props}
    >
      {track => (
        <TrackCarouselItem track={track} />
      )}
    </Carousel>
  );
}

export function AlbumCarousel({ albums, ...props }: { albums: any[] } & Omit<CarouselProps<any>, 'items' | 'children'>) {
  return (
    <Carousel
      items={albums}
      itemWidth={180}
      {...props}
    >
      {album => <AlbumCarouselItem album={album} />}
    </Carousel>
  );
}

export function PlaylistCarousel({ playlists, ...props }: { playlists: any[] } & Omit<CarouselProps<any>, 'items' | 'children'>) {
  return (
    <Carousel
      items={playlists}
      itemWidth={220}
      {...props}
    >
      {playlist => <PlaylistCarouselItem playlist={playlist} />}
    </Carousel>
  );
}

export function ArtistCarousel({ artists, ...props }: { artists: any[] } & Omit<CarouselProps<any>, 'items' | 'children'>) {
  return (
    <Carousel
      items={artists}
      itemWidth={160}
      {...props}
    >
      {artist => <ArtistCarouselItem artist={artist} />}
    </Carousel>
  );
}

// Carousel Item Components
function TrackCarouselItem({ track }: { track: any }) {
  return (
    <div className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="primary" className="scale-95 hover:scale-100 transition-transform">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </div>
      <h3 className="font-medium text-text-primary truncate text-sm">{track.title}</h3>
      <p className="text-text-secondary truncate text-xs">{track.artist}</p>
    </div>
  );
}

function AlbumCarouselItem({ album }: { album: any }) {
  return (
    <div className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="primary" className="scale-95 hover:scale-100 transition-transform">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </div>
      <h3 className="font-medium text-text-primary truncate text-sm">{album.title}</h3>
      <p className="text-text-secondary truncate text-xs">{album.artist}</p>
    </div>
  );
}

function PlaylistCarouselItem({ playlist }: { playlist: any }) {
  return (
    <div className="group">
      <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
        {playlist.coverUrl ? (
          <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Music className="w-10 h-10 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="primary" className="scale-95 hover:scale-100 transition-transform">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </div>
      <h3 className="font-medium text-text-primary truncate text-sm">{playlist.name}</h3>
      <p className="text-text-secondary truncate text-xs">Por {playlist.owner}</p>
    </div>
  );
}

function ArtistCarouselItem({ artist }: { artist: any }) {
  return (
    <div className="group">
      <div className="relative aspect-square rounded-full overflow-hidden mb-2">
        <img src={artist.avatarUrl} alt={artist.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <Button size="icon" variant="primary" className="scale-95 hover:scale-100 transition-transform">
            <Play className="w-6 h-6" />
          </Button>
        </div>
      </div>
      <h3 className="font-medium text-text-primary truncate text-sm text-center">{artist.name}</h3>
    </div>
  );
}

import { Play } from 'lucide-react';
import { Music } from 'lucide-react';