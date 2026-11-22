/**
 * Hub Music - Player Bar
 * Player fixo no rodapé, responsivo para desktop e mobile
 * Fixed player at bottom, responsive for desktop and mobile
 * @languages pt-BR / en-US
 */

import { usePlayer } from '../../hooks/usePlayer';
import { Waveform } from './Waveform';
import { formatDuration } from '../../lib/utils';
import { cn } from '../../lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  ListMusic,
  Mic,
  MoreHorizontal
} from 'lucide-react';

export function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    togglePlay,
    next,
    previous,
    seek,
    setVolume,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    queue
  } = usePlayer();

  if (!currentTrack) return null;

  const isMuted = volume === 0;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className={cn(
        'player-bar flex items-center gap-4 px-4 lg:px-6',
        'bg-background border-t border-border/50 backdrop-blur-md',
        isMobile ? 'h-auto min-h-[80px] p-3 lg:p-4 flex-col gap-3' : 'h-20 lg:h-24 flex-row gap-4 px-4 lg:px-6',
        'pb-safe-bottom'
      )}
    >
      {/* Track Info */}
      <div className="flex items-center gap-3 min-w-0 flex-shrink-0 lg:w-64">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className={cn(
              'w-14 h-14 lg:w-16 lg:h-16 rounded-lg object-cover shadow-lg',
              isMobile ? 'w-12 h-12' : 'w-14 h-14'
            )}
          />
        ) : (
          <div
            className={cn(
              'w-14 h-14 lg:w-16 lg:h-16 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-lg',
              isMobile ? 'w-12 h-12' : 'w-14 h-14'
            )}
          >
            <Mic className={cn('w-7 h-7 lg:w-8 lg:h-8 text-white', isMobile ? 'w-6 h-6' : 'w-7 h-7')} />
          </div>
        )}
        <div className="min-w-0">
          <p className={cn('font-medium text-text-primary truncate', isMobile ? 'text-sm' : 'text-base')}>
            {currentTrack.title}
          </p>
          <p className={cn('text-sm text-text-secondary truncate', isMobile ? 'text-xs' : 'text-sm')}>
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Waveform & Controls */}
      <div className={cn(
        'flex-1 flex flex-col items-center gap-2 min-w-0',
        isMobile ? 'flex-row gap-2' : 'flex-col gap-2'
      )}>
        {/* Waveform */}
        <Waveform
          peaks={currentTrack.waveformData || []}
          duration={duration}
          currentTime={currentTime}
          onSeek={seek}
          height={isMobile ? 40 : 60}
          className={cn(
            'w-full max-w-2xl',
            isMobile ? 'h-10' : 'h-10 max-w-full'
          )}
        />

        {/* Controls Row */}
        <div className="flex items-center gap-2 lg:gap-4 flex-wrap">
          <button
            onClick={toggleShuffle}
            className={cn(
              'p-2 rounded-xl transition-colors',
              shuffle ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
            )}
            aria-label="Shuffle"
            aria-pressed={shuffle}
          >
            <Shuffle className={cn('w-5 h-5', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>

          <button
            onClick={previous}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Previous"
          >
            <SkipBack className={cn('w-5 h-5', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>

          <button
            onClick={togglePlay}
            className={cn(
              'p-3 bg-primary text-white rounded-full shadow-glow hover:shadow-glow-lg transition-all hover:scale-105',
              isMobile ? 'p-2.5' : 'p-3'
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className={cn('w-6 h-6 ml-0.5', isMobile ? 'w-5 h-5' : 'w-6 h-6')} />
            ) : (
              <Play className={cn('w-6 h-6 ml-0.5', isMobile ? 'w-5 h-5' : 'w-6 h-6')} />
            )}
          </button>

          <button
            onClick={next}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Next"
          >
            <SkipForward className={cn('w-5 h-5', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>

          <button
            onClick={toggleRepeat}
            className={cn(
              'p-2 rounded-xl transition-colors',
              repeat !== 'off' ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
            )}
            aria-label={`Repeat: ${repeat}`}
            aria-pressed={repeat !== 'off'}
          >
            <Repeat className={cn('w-5 h-5', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
          </button>
        </div>
      </div>

      {/* Right Side - Volume & Queue */}
      <div
        className={cn(
          'flex items-center gap-3 min-w-0 lg:w-64 justify-end',
          isMobile ? 'w-full justify-between pt-2' : 'flex-row gap-3 lg:w-64 justify-end'
        )}
      >
        {/* Like button */}
        <button
          className="p-2 text-text-secondary hover:text-error transition-colors"
          aria-label="Like"
        >
          <Heart className={cn('w-5 h-5', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 hidden sm:flex">
          <button
            onClick={() => setVolume(isMuted ? 0.8 : 0)}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20 h-1 appearance-none bg-background-tertiary rounded-full accent-primary cursor-pointer"
            aria-label="Volume"
          />
        </div>

        {/* Time */}
        <div className={cn(
          'flex items-center gap-1 text-text-muted text-caption font-mono hidden sm:flex',
          isMobile ? 'flex flex-row' : 'hidden sm:flex'
        )}>
          <span className={cn('w-10 text-right', isMobile ? 'w-8 text-xs' : 'w-10 text-sm')}>
            {formatDuration(currentTime)}
          </span>
          <span className={cn('w-10', isMobile ? 'w-8 text-xs' : 'w-10 text-sm')}>
            {formatDuration(duration)}
          </span>
        </div>

        {/* Queue button */}
        <button
          className={cn(
            'p-2 text-text-secondary hover:text-text-primary transition-colors',
            isMobile ? 'w-8 h-8 flex items-center justify-center' : 'p-2'
          )}
          aria-label="Queue"
        >
          <ListMusic className={cn('w-5 h-5', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
        </button>

        {/* More options */}
        <button
          className="p-2 text-text-secondary hover:text-text-primary transition-colors hidden lg:flex"
          aria-label="Mais opções"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
