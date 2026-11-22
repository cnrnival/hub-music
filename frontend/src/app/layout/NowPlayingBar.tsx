/**
 * Hub Music - NowPlayingBar
 * Barra de reprodução persistente (bottom bar)
 * Persistent playback bar (bottom bar)
 *
 * @languages pt-BR / en-US
 */

import { useEffect } from 'react';
import { cn, formatDuration } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Mic,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { MiniWaveform } from '@/components/player/MiniWaveform';
import { usePlayerStore } from '@/state/playerStore';
import { useUIStore } from '@/state/uiStore';

export function NowPlayingBar() {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    shuffle,
    repeatMode,
    queue,
    currentIndex,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    toggleQueuePanel,
    togglePip,
    queuePanelOpen,
  } = usePlayerStore();

  const { addToast } = useUIStore();

  const isMuted = volume === 0;
  const queueLength = queue.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) seek(position + 5);
          else next();
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) seek(position - 5);
          else previous();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
          setVolume(isMuted ? 0.8 : 0);
          break;
        case 's':
          toggleShuffle();
          addToast({ id: Date.now().toString(), content: shuffle ? 'Aleatório desativado' : 'Aleatório ativado', type: 'info' });
          break;
        case 'r':
          toggleRepeat();
          const modes = { off: 'Repetir desativado', all: 'Repetir tudo', one: 'Repetir uma' };
          addToast({ id: Date.now().toString(), content: modes[repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'], type: 'info' });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, next, previous, seek, setVolume, volume, isMuted, toggleShuffle, toggleRepeat, repeatMode, shuffle, addToast]);

  if (!currentTrack && queueLength === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border',
        'flex items-center gap-4 p-2 lg:p-3',
        'transition-all duration-300'
      )}
      role="region"
      aria-label="Player de música"
    >
      {/* Track Info (25%) */}
      <div className="flex items-center gap-3 w-1/4 min-w-0 flex-shrink-0">
        {currentTrack ? (
          <>
            <div className="relative w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 rounded-lg overflow-hidden">
              {currentTrack.coverUrl ? (
                <img
                  src={currentTrack.coverUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
                  <Music className="w-6 h-6 text-white/50" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-text-primary truncate">{currentTrack.title}</p>
              <p className="text-caption text-text-secondary truncate">{currentTrack.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(currentTrack.userLiked && 'text-error')}
              onClick={() => {}}
              aria-label={currentTrack.userLiked ? 'Descurtir' : 'Curtir'}
              aria-pressed={currentTrack.userLiked}
            >
              <Heart className={cn('w-5 h-5', currentTrack.userLiked && 'fill-current')} />
            </Button>
          </>
        ) : (
          <div className="w-14 h-14 lg:w-16 lg:h-16 flex-shrink-0 rounded-lg bg-background-tertiary" />
        )}
      </div>

      {/* Playback Controls (50%) */}
      <div className="flex flex-col items-center gap-2 w-1/2 min-w-0">
        {/* Controls row */}
        <div className="flex items-center gap-2 lg:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleShuffle}
            className={cn(shuffle && 'text-primary')}
            aria-label="Aleatório"
            aria-pressed={shuffle}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={previous}
            aria-label="Anterior"
            disabled={queueLength === 0}
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            onClick={togglePlay}
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary text-white shadow-glow hover:shadow-glow-lg transition-all"
            aria-label={isPlaying ? 'Pausar' : 'Reproduzir'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 lg:w-7 lg:h-7" />
            ) : (
              <Play className="w-6 h-6 lg:w-7 lg:h-7 ml-1" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={next}
            aria-label="Próxima"
            disabled={queueLength === 0}
          >
            <SkipForward className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRepeat}
            className={cn(repeatMode !== 'off' && 'text-primary')}
            aria-label={repeatMode === 'off' ? 'Repetir desativado' : repeatMode === 'all' ? 'Repetir tudo' : 'Repetir uma'}
            aria-pressed={repeatMode !== 'off'}
          >
            <Repeat className={cn('w-4 h-4', repeatMode === 'one' && 'text-primary')} />
            {repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[10px] font-bold text-primary">1</span>}
          </Button>
        </div>

        {/* Progress Bar with Mini Waveform */}
        <div className="w-full max-w-md flex items-center gap-3">
          <span className="text-caption text-text-muted font-mono w-10 text-right">
            {formatDuration(position)}
          </span>
          <div className="flex-1 relative h-2">
            <MiniWaveform
              peaks={currentTrack?.waveformData || []}
              duration={duration}
              progress={duration > 0 ? position / duration : 0}
              onSeek={seek}
              height={40}
              className="w-full h-full"
            />
            <div className="absolute inset-0" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seek(percent * duration);
            }} style={{ cursor: 'pointer' }} />
          </div>
          <span className="text-caption text-text-muted font-mono w-10">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Volume & Queue (25%) */}
      <div className="flex items-center justify-end gap-2 w-1/4 min-w-0">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVolume(isMuted ? 0.8 : 0)}
            aria-label={isMuted ? 'Ativar som' : 'Mutar'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-24 h-1 appearance-none bg-background-tertiary rounded-full accent-primary cursor-pointer"
            aria-label="Volume"
          />
        </div>

        {/* Queue / PIP / Fullscreen */}
        <div className="flex items-center gap-1 ml-2 lg:ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleQueuePanel}
            className={cn(queuePanelOpen && 'text-primary')}
            aria-label="Fila de reprodução"
            aria-expanded={queuePanelOpen}
            aria-controls="queue-panel"
          >
            <ListMusic className="w-5 h-5" />
            {queueLength > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                {queueLength > 9 ? '9+' : queueLength}
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePip}
            aria-label="Mini player flutuante"
          >
            <Maximize2 className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Music } from 'lucide-react';