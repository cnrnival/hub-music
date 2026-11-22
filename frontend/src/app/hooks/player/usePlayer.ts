/**
 * Hub Music - usePlayer Hook
 * Hook do player que conecta ao Zustand store
 * Player hook connecting to Zustand store
 *
 * @languages pt-BR / en-US
 */

import { usePlayerStore } from '../../../state/playerStore';
import { useAudio } from './useAudio';
import { useWaveform } from './useWaveform';
import { usePlayerSnapshot } from './usePlayerSnapshot';
import { useEffect, useCallback } from 'react';
import { useAuth } from '../auth/useAuth';
import { api } from '../../../lib/api';

export function usePlayer() {
  const store = usePlayerStore();
  const audio = useAudio();
  const waveform = useWaveform();
  const { user } = useAuth();

  // Initialize snapshot persistence
  usePlayerSnapshot();

  // Sync Howler → Store (position, duration, state)
  useEffect(() => {
    const howl = audio.currentHowl;
    if (!howl) return;

    const interval = setInterval(() => {
      if (howl.playing()) {
        store.setPosition(howl.seek() as number);
        store.setDuration(howl.duration());
      }
    }, 250);

    return () => clearInterval(interval);
  }, [audio.currentHowl, store]);

  // Auto-advance on track end
  useEffect(() => {
    const howl = audio.currentHowl;
    if (!howl) return;

    const handler = () => {
      store.next();
    };

    howl.on('end', handler);
    return () => howl.off('end', handler);
  }, [audio.currentHowl, store]);

  // Increment play count when track finishes (90% threshold)
  useEffect(() => {
    if (store.currentTrack && !store.isPlaying && store.position >= store.duration * 0.9 && store.duration > 0) {
      api.axios.post(`/tracks/${store.currentTrack.id}/play-count`).catch(console.error);
    }
  }, [store.currentTrack, store.isPlaying, store.position, store.duration]);

  // Expose store actions with proper typing
  return {
    // State
    currentTrack: store.currentTrack,
    currentQueueTrack: store.currentQueueTrack,
    queue: store.queue,
    history: store.history,
    currentIndex: store.currentIndex,
    isPlaying: store.isPlaying,
    position: store.position,
    duration: store.duration,
    volume: store.volume,
    playbackRate: store.playbackRate,
    shuffle: store.shuffle,
    repeatMode: store.repeatMode,
    crossfade: store.crossfade,
    crossfadeDuration: store.crossfadeDuration,
    pipVisible: store.pipVisible,
    pipPosition: store.pipPosition,
    pipSize: store.pipSize,
    queuePanelOpen: store.queuePanelOpen,
    lyricsPanelOpen: store.lyricsPanelOpen,
    devicePickerOpen: store.devicePickerOpen,

    // Playback actions
    play: store.play,
    pause: store.pause,
    togglePlay: store.togglePlay,
    seek: store.seek,
    seekRelative: store.seekRelative,
    next: store.next,
    previous: store.previous,
    setVolume: store.setVolume,
    setPlaybackRate: store.setPlaybackRate,
    toggleMute: store.toggleMute,

    // Queue actions
    addToQueue: store.addToQueue,
    removeFromQueue: store.removeFromQueue,
    moveQueueItem: store.moveQueueItem,
    clearQueue: store.clearQueue,
    playNext: store.playNext,
    playLater: store.playLater,

    // Mode actions
    toggleShuffle: store.toggleShuffle,
    toggleRepeat: store.toggleRepeat,
    setRepeatMode: store.setRepeatMode,
    toggleCrossfade: store.toggleCrossfade,

    // PIP actions
    togglePip: store.togglePip,
    setPipPosition: store.setPipPosition,
    setPipSize: store.setPipSize,

    // Panel actions
    toggleQueuePanel: store.toggleQueuePanel,
    toggleLyricsPanel: store.toggleLyricsPanel,
    toggleDevicePicker: store.toggleDevicePicker,

    // Snapshot
    snapshot: store.snapshot,
    restore: store.restore,
    hydrate: store.hydrate,
  };
}

// Also export the raw store for direct access
export { usePlayerStore } from '../../../state/playerStore';