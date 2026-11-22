/**
 * Hub Music - useWaveform Hook
 * Factory Wavesurfer.js por track (peaks, regiões, cursor)
 * Wavesurfer.js factory per track (peaks, regions, cursor)
 *
 * @languages pt-BR / en-US
 */

import { create } from 'zustand';
import WaveSurfer from 'wavesurfer.js';

interface WaveformInstance {
  id: string;
  wavesurfer: WaveSurfer | null;
  container: HTMLElement | null;
  peaks: number[];
  duration: number;
  isReady: boolean;
  isPlaying: boolean;
}

interface WaveformState {
  instances: Map<string, WaveformInstance>;

  // Actions
  createInstance: (id: string, container: HTMLElement, peaks: number[], duration: number, options?: WaveformOptions) => WaveSurfer;
  getInstance: (id: string) => WaveformInstance | undefined;
  destroyInstance: (id: string) => void;
  destroyAll: () => void;
  play: (id: string) => void;
  pause: (id: string) => void;
  seek: (id: string, seconds: number) => void;
  setVolume: (id: string, volume: number) => void;
  onReady: (id: string, callback: () => void) => void;
  onFinish: (id: string, callback: () => void) => void;
  onAudioprocess: (id: string, callback: (time: number) => void) => void;
  addRegion: (id: string, region: WaveformRegion) => void;
  clearRegions: (id: string) => void;
}

export interface WaveformOptions {
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  height?: number;
  interact?: boolean;
  hideScrollbar?: boolean;
  autoCenter?: boolean;
  minPxPerSec?: number;
  pixelRatio?: number;
}

export interface WaveformRegion {
  id: string;
  start: number;
  end: number;
  color?: string;
  content?: string | HTMLElement;
  drag?: boolean;
  resize?: boolean;
}

const DEFAULT_OPTIONS: WaveformOptions = {
  waveColor: '#333333',
  progressColor: '#FF4081',
  cursorColor: '#FFFFFF',
  barWidth: 2,
  barGap: 1,
  barRadius: 2,
  height: 100,
  interact: true,
  hideScrollbar: true,
  autoCenter: false,
  minPxPerSec: 20,
  pixelRatio: window.devicePixelRatio || 1,
};

export const useWaveformStore = create<WaveformState>((set, get) => ({
  instances: new Map(),

  createInstance: (id: string, container: HTMLElement, peaks: number[], duration: number, options = {}) => {
    // Destroy existing instance if any
    const existing = get().instances.get(id);
    if (existing?.wavesurfer) {
      existing.wavesurfer.destroy();
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    const wavesurfer = WaveSurfer.create({
      container,
      waveColor: mergedOptions.waveColor,
      progressColor: mergedOptions.progressColor,
      cursorColor: mergedOptions.cursorColor,
      barWidth: mergedOptions.barWidth,
      barGap: mergedOptions.barGap,
      barRadius: mergedOptions.barRadius,
      height: mergedOptions.height,
      interact: mergedOptions.interact,
      hideScrollbar: mergedOptions.hideScrollbar,
      autoCenter: mergedOptions.autoCenter,
      minPxPerSec: mergedOptions.minPxPerSec,
      pixelRatio: mergedOptions.pixelRatio,
      backend: 'WebAudio',
      mediaControls: false,
    });

    // Load peaks directly (faster than decoding audio)
    wavesurfer.load('', peaks, duration);

    const instance: WaveformInstance = {
      id,
      wavesurfer,
      container,
      peaks,
      duration,
      isReady: false,
      isPlaying: false,
    };

    set((state) => {
      const newInstances = new Map(state.instances);
      newInstances.set(id, instance);
      return { instances: newInstances };
    });

    return wavesurfer;
  },

  getInstance: (id: string) => get().instances.get(id),

  destroyInstance: (id: string) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.destroy();
    }
    set((state) => {
      const newInstances = new Map(state.instances);
      newInstances.delete(id);
      return { instances: newInstances };
    });
  },

  destroyAll: () => {
    get().instances.forEach((instance) => {
      instance.wavesurfer?.destroy();
    });
    set({ instances: new Map() });
  },

  play: (id: string) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.play();
      set((state) => {
        const newInstances = new Map(state.instances);
        const inst = newInstances.get(id);
        if (inst) newInstances.set(id, { ...inst, isPlaying: true });
        return { instances: newInstances };
      });
    }
  },

  pause: (id: string) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.pause();
      set((state) => {
        const newInstances = new Map(state.instances);
        const inst = newInstances.get(id);
        if (inst) newInstances.set(id, { ...inst, isPlaying: false });
        return { instances: newInstances };
      });
    }
  },

  seek: (id: string, seconds: number) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.seekTo(seconds / instance.duration);
    }
  },

  setVolume: (id: string, volume: number) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.setVolume(Math.max(0, Math.min(1, volume)));
    }
  },

  onReady: (id: string, callback: () => void) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      if (instance.isReady) {
        callback();
      } else {
        instance.wavesurfer.once('ready', () => {
          set((state) => {
            const newInstances = new Map(state.instances);
            const inst = newInstances.get(id);
            if (inst) newInstances.set(id, { ...inst, isReady: true });
            return { instances: newInstances };
          });
          callback();
        });
      }
    }
  },

  onFinish: (id: string, callback: () => void) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.once('finish', callback);
    }
  },

  onAudioprocess: (id: string, callback: (time: number) => void) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.on('audioprocess', (time: number) => callback(time));
    }
  },

  addRegion: (id: string, region: WaveformRegion) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.addRegion({
        id: region.id,
        start: region.start,
        end: region.end,
        color: region.color || 'rgba(255, 64, 129, 0.3)',
        content: region.content,
        drag: region.drag ?? false,
        resize: region.resize ?? false,
      });
    }
  },

  clearRegions: (id: string) => {
    const instance = get().instances.get(id);
    if (instance?.wavesurfer) {
      instance.wavesurfer.clearRegions();
    }
  },
}));

// React hook
export function useWaveform() {
  return useWaveformStore();
}

// Non-React export
export const waveform = useWaveformStore.getState();