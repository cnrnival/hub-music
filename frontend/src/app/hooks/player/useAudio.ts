/**
 * Hub Music - useAudio Hook
 * Singleton Howler.js + AudioContext unlock para mobile
 * Howler.js singleton + AudioContext unlock for mobile
 *
 * @languages pt-BR / en-US
 */

import { create } from 'zustand';
import { Howl, Howler } from 'howler';

interface AudioState {
  currentHowl: Howl | null;
  audioContext: AudioContext | null;
  isUnlocked: boolean;

  // Actions
  createHowl: (src: string) => Howl;
  setCurrentHowl: (howl: Howl | null) => void;
  unlockAudioContext: () => Promise<void>;
  resumeAudioContext: () => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentHowl: null,
  audioContext: null,
  isUnlocked: false,

  createHowl: (src: string) => {
    const howl = new Howl({
      src: [src],
      format: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
      html5: true,
      preload: true,
      volume: get().audioContext ? Howler.volume() : 0.8,
    });
    return howl;
  },

  setCurrentHowl: (howl: Howl | null) => set({ currentHowl: howl }),

  unlockAudioContext: async () => {
    if (get().isUnlocked) return;

    try {
      // Create AudioContext on first user interaction
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();

      // Howler uses its own AudioContext, but we can share
      Howler.autoUnlock = false;
      Howler.ctx = audioContext;

      // Resume if suspended (mobile browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      set({ audioContext, isUnlocked: true });

      // Cleanup on page unload
      window.addEventListener('beforeunload', () => {
        audioContext.close();
      });
    } catch (error) {
      console.warn('Failed to unlock AudioContext:', error);
    }
  },

  resumeAudioContext: () => {
    const { audioContext } = get();
    if (audioContext?.state === 'suspended') {
      audioContext.resume();
    }
  },

  setVolume: (volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    Howler.volume(clamped);
    get().currentHowl?.volume(clamped);
  },

  getVolume: () => Howler.volume(),
}));

// Hook for React components
export function useAudio() {
  const store = useAudioStore();

  // Auto-unlock on first user gesture
  const handleUserInteraction = () => {
    store.unlockAudioContext();
    store.resumeAudioContext();
    // Remove listeners after first interaction
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.removeEventListener(event, handleUserInteraction);
    });
  };

  // Attach listeners on mount
  if (typeof window !== 'undefined') {
    ['click', 'touchstart', 'keydown'].forEach(event => {
      document.addEventListener(event, handleUserInteraction, { once: true, passive: true });
    });
  }

  return store;
}

// Export singleton instance for non-React usage
export const audio = useAudioStore.getState();