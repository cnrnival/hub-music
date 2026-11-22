/**
 * Hub Music - Player Store (Zustand)
 * Store global do player: estado completo, ações, persistência
 * Global player store: complete state, actions, persistence
 *
 * @languages pt-BR / en-US
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '@/lib/api';
import type {
  Track,
  QueuedTrack,
  RepeatMode,
  PlayContext,
  PlayerState,
  PlayerSnapshot,
  SNAPSHOT_STORAGE_KEY,
  SNAPSHOT_VERSION,
  SNAPSHOT_MAX_AGE,
} from '../types/player';

// Helper to create QueuedTrack from Track
function createQueuedTrack(track: Track, source: QueuedTrack['source'] = 'local', addedBy: QueuedTrack['addedBy'] = 'user'): QueuedTrack {
  return {
    id: `${track.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    track,
    source,
    addedAt: Date.now(),
    addedBy,
  };
}

// Fetch tracks for different play contexts
async function fetchTracksForContext(context: PlayContext): Promise<{ tracks: Track[]; startIndex: number }> {
  let tracks: Track[] = [];
  let startIndex = 0;

  switch (context.type) {
    case 'track': {
      const response = await api.getTrack(context.trackId);
      tracks = [response.data.track];
      break;
    }
    case 'playlist': {
      const response = await api.getPlaylist(context.playlistId);
      tracks = response.data.playlist?.tracks || [];
      startIndex = context.startIndex ?? 0;
      break;
    }
    case 'album': {
      const response = await api.getAlbum(context.albumId);
      tracks = response.data.album?.tracks || [];
      break;
    }
    case 'artist': {
      const response = await api.getArtistTopTracks(context.artistId);
      tracks = response.data.tracks || [];
      break;
    }
    case 'radio': {
      const response = await api.getRadioStationTracks(context.stationId);
      tracks = response.data.tracks || [];
      break;
    }
    case 'queue': {
      tracks = context.queue.map(q => q.track);
      break;
    }
  }

  return { tracks, startIndex };
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentTrack: null,
      currentQueueTrack: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      volume: 0.8,
      playbackRate: 1,
      queue: [],
      history: [],
      currentIndex: -1,
      repeatMode: 'off',
      shuffle: false,
      crossfade: false,
      crossfadeDuration: 5,
      pipVisible: false,
      pipPosition: { x: 20, y: 20 },
      pipSize: 'compact',
      queuePanelOpen: false,
      lyricsPanelOpen: false,
      devicePickerOpen: false,

      // --- Playback Actions ---

      play: async (context: PlayContext, options?: { startPosition?: number }) => {
        const { audio } = await import('../hooks/player/useAudio');
        const { waveform } = await import('../hooks/player/useWaveform');

        const { tracks, startIndex } = await fetchTracksForContext(context);
        if (tracks.length === 0) return;

        const queueTracks = tracks.map(t => createQueuedTrack(t));
        const firstTrack = tracks[startIndex];

        // Update state
        set({
          queue: queueTracks,
          currentIndex: startIndex,
          currentTrack: firstTrack,
          currentQueueTrack: queueTracks[startIndex] || null,
          isPlaying: true,
          position: options?.startPosition ?? 0,
        });

        // Play via audio hook
        const howl = audio.createHowl(firstTrack.streamUrl || firstTrack.audioUrl);
        howl.once('load', () => {
          set({ duration: howl.duration() });
          howl.seek(options?.startPosition ?? 0);
          howl.play();
        });
        howl.on('end', () => get().next());
        howl.on('play', () => set({ isPlaying: true }));
        howl.on('pause', () => set({ isPlaying: false }));

        audio.setCurrentHowl(howl);
        waveform.load(firstTrack.id, firstTrack.waveformData || []);
      },

      pause: () => {
        const { audio } = require('../hooks/player/useAudio');
        audio.getState().currentHowl?.pause();
        set({ isPlaying: false });
      },

      togglePlay: () => {
        const { audio } = require('../hooks/player/useAudio');
        const howl = audio.getState().currentHowl;
        if (howl) {
          if (howl.playing()) {
            howl.pause();
          } else {
            howl.play();
          }
        } else if (get().currentTrack) {
          get().play({ type: 'track', trackId: get().currentTrack!.id });
        }
      },

      seek: (seconds: number) => {
        const { audio } = require('../hooks/player/useAudio');
        const howl = audio.getState().currentHowl;
        if (howl) {
          const duration = howl.duration();
          const clamped = Math.max(0, Math.min(seconds, duration || seconds));
          howl.seek(clamped);
          set({ position: clamped });
        }
      },

      seekRelative: (delta: number) => {
        const { position, duration } = get();
        const newPosition = Math.max(0, Math.min(position + delta, duration));
        get().seek(newPosition);
      },

      next: () => {
        const { queue, currentIndex, repeatMode, shuffle } = get();
        if (queue.length === 0) return;

        let nextIndex: number;
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length);
        } else {
          nextIndex = currentIndex + 1;
          if (nextIndex >= queue.length) {
            if (repeatMode === 'all') {
              nextIndex = 0;
            } else {
              // End of queue
              set({ isPlaying: false, position: 0 });
              return;
            }
          }
        }

        const nextTrack = queue[nextIndex];
        if (nextTrack) {
          // Move current to history
          const { currentQueueTrack, history } = get();
          if (currentQueueTrack) {
            set({ history: [currentQueueTrack, ...history.slice(0, 49)] });
          }

          set({
            currentIndex: nextIndex,
            currentTrack: nextTrack.track,
            currentQueueTrack: nextTrack,
            position: 0,
            isPlaying: true,
          });

          // Play next track
          const { audio } = require('../hooks/player/useAudio');
          const { waveform } = require('../hooks/player/useWaveform');
          const howl = audio.createHowl(nextTrack.track.streamUrl || nextTrack.track.audioUrl);
          howl.once('load', () => {
            set({ duration: howl.duration() });
            howl.play();
          });
          howl.on('end', () => get().next());
          audio.setCurrentHowl(howl);
          waveform.load(nextTrack.track.id, nextTrack.track.waveformData || []);
        }
      },

      previous: () => {
        const { queue, currentIndex, shuffle, history } = get();
        if (queue.length === 0 && history.length === 0) return;

        let prevIndex: number;
        let prevTrack: QueuedTrack | null = null;

        if (shuffle) {
          prevIndex = Math.floor(Math.random() * queue.length);
          prevTrack = queue[prevIndex];
        } else if (currentIndex > 0) {
          prevIndex = currentIndex - 1;
          prevTrack = queue[prevIndex];
        } else if (history.length > 0) {
          // Go back to history
          prevTrack = history[0];
          set({ history: history.slice(1) });
        } else {
          return;
        }

        if (prevTrack) {
          set({
            currentIndex: prevIndex,
            currentTrack: prevTrack.track,
            currentQueueTrack: prevTrack,
            position: 0,
            isPlaying: true,
          });

          const { audio } = require('../hooks/player/useAudio');
          const { waveform } = require('../hooks/player/useWaveform');
          const howl = audio.createHowl(prevTrack.track.streamUrl || prevTrack.track.audioUrl);
          howl.once('load', () => {
            set({ duration: howl.duration() });
            howl.play();
          });
          howl.on('end', () => get().next());
          audio.setCurrentHowl(howl);
          waveform.load(prevTrack.track.id, prevTrack.track.waveformData || []);
        }
      },

      setVolume: (volume: number) => {
        const clamped = Math.max(0, Math.min(1, volume));
        const { audio } = require('../hooks/player/useAudio');
        audio.getState().currentHowl?.volume(clamped);
        set({ volume: clamped });
      },

      setPlaybackRate: (rate: number) => {
        const clamped = Math.max(0.5, Math.min(2, rate));
        const { audio } = require('../hooks/player/useAudio');
        audio.getState().currentHowl?.rate(clamped);
        set({ playbackRate: clamped });
      },

      toggleMute: () => {
        const { volume } = get();
        get().setVolume(volume > 0 ? 0 : 0.8);
      },

      // --- Queue Management ---

      addToQueue: (tracks: Track[], position = 'end', source = 'local') => {
        const queuedTracks = tracks.map(t => createQueuedTrack(t, source));
        set((state) => {
          let newQueue = [...state.queue];
          if (position === 'next') {
            newQueue.splice(state.currentIndex + 1, 0, ...queuedTracks);
          } else {
            newQueue.push(...queuedTracks);
          }
          return { queue: newQueue };
        });
      },

      removeFromQueue: (index: number) => {
        set((state) => {
          const newQueue = state.queue.filter((_, i) => i !== index);
          let newIndex = state.currentIndex;
          if (index < state.currentIndex) {
            newIndex = state.currentIndex - 1;
          } else if (index === state.currentIndex && !state.isPlaying) {
            // If removing current and not playing, load next
            if (newQueue.length > 0) {
              const nextIdx = Math.min(index, newQueue.length - 1);
              newIndex = nextIdx;
            } else {
              newIndex = -1;
            }
          }
          return { queue: newQueue, currentIndex: newIndex };
        });
      },

      moveQueueItem: (from: number, to: number) => {
        set((state) => {
          const newQueue = [...state.queue];
          const [item] = newQueue.splice(from, 1);
          newQueue.splice(to, 0, item);
          let newIndex = state.currentIndex;
          if (from === state.currentIndex) newIndex = to;
          else if (from < state.currentIndex && to >= state.currentIndex) newIndex--;
          else if (from > state.currentIndex && to <= state.currentIndex) newIndex++;
          return { queue: newQueue, currentIndex: newIndex };
        });
      },

      clearQueue: () => {
        const { audio } = require('../hooks/player/useAudio');
        audio.getState().currentHowl?.stop();
        audio.getState().currentHowl?.unload();
        audio.setCurrentHowl(null);
        set({
          queue: [],
          history: [],
          currentIndex: -1,
          currentTrack: null,
          currentQueueTrack: null,
          isPlaying: false,
          position: 0,
          duration: 0,
        });
      },

      playNext: (track: Track) => {
        get().addToQueue([track], 'next');
      },

      playLater: (track: Track) => {
        get().addToQueue([track], 'end');
      },

      // --- Modes ---

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

      toggleRepeat: () => set((state) => ({
        repeatMode: state.repeatMode === 'off' ? 'all' : state.repeatMode === 'all' ? 'one' : 'off'
      })),

      setRepeatMode: (mode: RepeatMode) => set({ repeatMode: mode }),

      toggleCrossfade: () => set((state) => ({ crossfade: !state.crossfade })),

      // --- PIP ---

      togglePip: () => set((state) => ({ pipVisible: !state.pipVisible })),

      setPipPosition: (pos: { x: number; y: number }) => set({ pipPosition: pos }),

      setPipSize: (size: 'mini' | 'compact' | 'full') => set({ pipSize: size }),

      // --- Panels ---

      toggleQueuePanel: () => set((state) => ({ queuePanelOpen: !state.queuePanelOpen })),

      toggleLyricsPanel: () => set((state) => ({ lyricsPanelOpen: !state.lyricsPanelOpen })),

      toggleDevicePicker: () => set((state) => ({ devicePickerOpen: !state.devicePickerOpen })),

      // --- Snapshot ---

      snapshot: (): PlayerSnapshot => {
        const state = get();
        return {
          version: SNAPSHOT_VERSION,
          timestamp: Date.now(),
          currentTrack: state.currentTrack,
          queue: state.queue,
          history: state.history,
          currentIndex: state.currentIndex,
          position: state.position,
          volume: state.volume,
          playbackRate: state.playbackRate,
          repeatMode: state.repeatMode,
          shuffle: state.shuffle,
          crossfade: state.crossfade,
          pipVisible: state.pipVisible,
          pipPosition: state.pipPosition,
          pipSize: state.pipSize,
        };
      },

      restore: (snapshot: PlayerSnapshot) => {
        if (snapshot.version !== SNAPSHOT_VERSION) return;
        if (Date.now() - snapshot.timestamp > SNAPSHOT_MAX_AGE) return;

        set({
          currentTrack: snapshot.currentTrack,
          queue: snapshot.queue,
          history: snapshot.history,
          currentIndex: snapshot.currentIndex,
          position: snapshot.position,
          volume: snapshot.volume,
          playbackRate: snapshot.playbackRate,
          repeatMode: snapshot.repeatMode,
          shuffle: snapshot.shuffle,
          crossfade: snapshot.crossfade,
          pipVisible: snapshot.pipVisible,
          pipPosition: snapshot.pipPosition,
          pipSize: snapshot.pipSize,
          isPlaying: false, // Don't auto-play on restore
        });

        // Restore audio if there's a current track
        if (snapshot.currentTrack && snapshot.queue[snapshot.currentIndex]) {
          const { audio } = require('../hooks/player/useAudio');
          const howl = audio.createHowl(snapshot.currentTrack.streamUrl || snapshot.currentTrack.audioUrl);
          howl.once('load', () => {
            howl.seek(snapshot.position);
          });
          audio.setCurrentHowl(howl);
          const { waveform } = require('../hooks/player/useWaveform');
          waveform.load(snapshot.currentTrack.id, snapshot.currentTrack.waveformData || []);
        }
      },

      hydrate: () => {
        // Called on app mount - handled by persist middleware
      },
    }),
    {
      name: SNAPSHOT_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        queue: state.queue,
        history: state.history,
        currentIndex: state.currentIndex,
        position: state.position,
        volume: state.volume,
        playbackRate: state.playbackRate,
        repeatMode: state.repeatMode,
        shuffle: state.shuffle,
        crossfade: state.crossfade,
        pipVisible: state.pipVisible,
        pipPosition: state.pipPosition,
        pipSize: state.pipSize,
        // Don't persist currentTrack (can be large), will be restored from queue
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrate();
        }
      },
    }
  )
);