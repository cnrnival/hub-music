/**
 * Hub Music - PipMiniPlayer
 * Mini player flutuante (Picture-in-Picture)
 * Floating mini player (Picture-in-Picture)
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  X,
  Maximize2,
  Minimize2,
  GripVertical,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { MiniWaveform } from '../components/player/MiniWaveform';
import { usePlayerStore } from '../../state/playerStore';
import { formatDuration } from '../../lib/utils';

interface PipMiniPlayerProps {
  position: { x: number; y: number };
  size: 'mini' | 'compact' | 'full';
  onPositionChange: (pos: { x: number; y: number }) => void;
  onSizeChange: (size: 'mini' | 'compact' | 'full') => void;
  onClose: () => void;
}

export function PipMiniPlayer({ position, size, onPositionChange, onSizeChange, onClose }: PipMiniPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    position: trackPosition,
    duration,
    volume,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    togglePip,
  } = usePlayerStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const pipRef = useRef<HTMLDivElement>(null);

  const sizes = {
    mini: { width: 64, height: 64 },
    compact: { width: 280, height: 80 },
    full: { width: 420, height: 140 },
  };

  const currentSize = sizes[size];

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newPos = {
        x: Math.max(0, Math.min(window.innerWidth - currentSize.width, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - currentSize.height - 90, e.clientY - dragOffset.y)), // 90px for NowPlayingBar
      };
      onPositionChange(newPos);
    };

    const handleMouseUp = () => setIsDragging(false);

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newPos = {
        x: Math.max(0, Math.min(window.innerWidth - currentSize.width, touch.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - currentSize.height - 90, touch.clientY - dragOffset.y)),
      };
      onPositionChange(newPos);
    };

    const handleTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragOffset, currentSize, onPositionChange]);

  // Handle resize (for compact/full)
  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.stopPropagation();
    e.preventDefault();
  };

  useEffect(() => {
    const handleResizeMove = (e: MouseEvent) => {
      if (!isResizing) return;
      // Could implement resize logic here
    };

    const handleResizeEnd = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing]);

  if (!currentTrack) return null;

  const renderMini = () => (
    <div className="relative w-full h-full rounded-xl bg-background/95 backdrop-blur-lg border border-border overflow-hidden">
      {currentTrack.coverUrl ? (
        <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
          <Music className="w-8 h-8 text-white/50" />
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute inset-0 w-full h-full p-0"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
      >
        {isPlaying ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
      </Button>
    </div>
  );

  const renderCompact = () => (
    <div className="flex items-center gap-3 w-full h-full p-2 bg-background/95 backdrop-blur-lg border border-border rounded-xl">
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
        {currentTrack.coverUrl ? (
          <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
            <Music className="w-6 h-6 text-white/50" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary truncate">{currentTrack.title}</p>
          <p className="text-caption text-text-secondary truncate">{currentTrack.artist}</p>
        </div>
        <MiniWaveform
          peaks={currentTrack.waveformData || []}
          duration={duration}
          progress={duration > 0 ? trackPosition / duration : 0}
          onSeek={seek}
          height={20}
          className="w-full"
        />
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={previous} aria-label="Anterior"><SkipBack className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" onClick={togglePlay} aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={next} aria-label="Próxima"><SkipForward className="w-4 h-4" /></Button>
      </div>
    </div>
  );

  const renderFull = () => (
    <div className="w-full h-full p-4 bg-background/95 backdrop-blur-lg border border-border rounded-xl flex flex-col gap-3">
      {/* Drag handle */}
      <div className="flex items-center justify-between">
        <div className="w-8 h-1 bg-border rounded-full mx-auto" />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={togglePip} aria-label="Restaurar player"><Minimize2 className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          {currentTrack.coverUrl ? (
            <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
              <Music className="w-10 h-10 text-white/50" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-text-primary truncate">{currentTrack.title}</h3>
            <p className="text-sm text-text-secondary truncate">{currentTrack.artist}</p>
          </div>
          <MiniWaveform
            peaks={currentTrack.waveformData || []}
            duration={duration}
            progress={duration > 0 ? trackPosition / duration : 0}
            onSeek={seek}
            height={24}
            className="w-full"
          />
          <div className="flex items-center gap-4 text-caption text-text-muted">
            <span>{formatDuration(trackPosition)}</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={previous} aria-label="Anterior"><SkipBack className="w-5 h-5" /></Button>
            <Button onClick={togglePlay} className="w-10 h-10 rounded-full bg-primary text-white" aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}>
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={next} aria-label="Próxima"><SkipForward className="w-5 h-5" /></Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setVolume(volume === 0 ? 0.8 : 0)} aria-label={volume === 0 ? 'Ativar som' : 'Mutar'}>
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-24 h-1 appearance-none bg-background-tertiary rounded-full accent-primary" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      ref={pipRef}
      className={cn(
        'fixed z-50 transition-all duration-200 shadow-2xl',
        'rounded-xl overflow-hidden',
        isDragging && 'cursor-grabbing',
        size === 'mini' && 'w-16 h-16',
        size === 'compact' && 'w-[280px] h-20',
        size === 'full' && 'w-[420px] h-[140px]'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: currentSize.width,
        height: currentSize.height,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      role="dialog"
      aria-label="Mini player"
    >
      {size === 'mini' && renderMini()}
      {size === 'compact' && renderCompact()}
      {size === 'full' && renderFull()}

      {/* Resize handle (bottom-right) for compact/full */}
      {(size === 'compact' || size === 'full') && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center"
          onMouseDown={handleResizeStart}
          aria-label="Redimensionar"
        >
          <GripVertical className="w-3 h-3 text-text-muted/50 rotate-45" />
        </div>
      )}
    </div>
  );
}

import { Music, Volume2, VolumeX } from 'lucide-react';