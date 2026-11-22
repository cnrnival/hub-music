/**
 * Hub Music - useCrossfade Hook
 * Crossfade gapless entre faixas
 * Gapless crossfade between tracks
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../../../state/playerStore';
import { useAudio } from './useAudio';

interface CrossfadeState {
  isCrossfading: boolean;
  fadeOutTrack: string | null;
  fadeInTrack: string | null;
  progress: number; // 0-1
}

export function useCrossfade() {
  const {
    crossfade,
    crossfadeDuration,
    queue,
    currentIndex,
    history,
    currentTrack,
    isPlaying,
    next,
  } = usePlayerStore();

  const audio = useAudio();
  const crossfadeRef = useRef<CrossfadeState>({
    isCrossfading: false,
    fadeOutTrack: null,
    fadeInTrack: null,
    progress: 0,
  });

  const nextTrackRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  // Preload next track for crossfade
  const preloadNextTrack = useCallback(async () => {
    if (!crossfade || !isPlaying || queue.length === 0) return;

    const currentQueueIndex = currentIndex - history.length - 1;
    if (currentQueueIndex < 0 || currentQueueIndex >= queue.length - 1) return;

    const nextTrack = queue[currentQueueIndex + 1];
    if (!nextTrack || crossfadeRef.current.fadeInTrack === nextTrack.track.id) return;

    try {
      // Create new Howler instance for next track
      const { Howl } = await import('howler');
      const nextHowl = new Howl({
        src: [nextTrack.track.streamUrl || nextTrack.track.previewUrl || ''],
        format: ['mp3', 'ogg'],
        html5: true, // Use HTML5 Audio for streaming
        preload: true,
        volume: 0, // Start muted
        onload: () => {
          nextTrackRef.current = nextHowl._sounds[0]?._node as HTMLAudioElement;
        },
        onloaderror: () => {
          console.warn('Failed to preload next track for crossfade');
          nextTrackRef.current = null;
        },
      });

      crossfadeRef.current.fadeInTrack = nextTrack.track.id;
    } catch (error) {
      console.error('Crossfade preload error:', error);
    }
  }, [crossfade, isPlaying, queue, currentIndex, history]);

  // Execute crossfade
  const executeCrossfade = useCallback(() => {
    if (!crossfade || crossfadeRef.current.isCrossfading) return;

    const currentQueueIndex = currentIndex - history.length - 1;
    if (currentQueueIndex < 0 || currentQueueIndex >= queue.length - 1) return;

    const nextTrack = queue[currentQueueIndex + 1];
    if (!nextTrack || !nextTrackRef.current) return;

    crossfadeRef.current = {
      isCrossfading: true,
      fadeOutTrack: currentTrack?.id || null,
      fadeInTrack: nextTrack.track.id,
      progress: 0,
    };

    const fadeOutHowl = audio.getCurrentHowl();
    const fadeInHowl = nextTrackRef.current;

    if (!fadeOutHowl || !fadeInHowl) {
      crossfadeRef.current.isCrossfading = false;
      return;
    }

    // Start playing next track at volume 0
    fadeInHowl.play();
    fadeInHowl.volume = 0;

    const duration = crossfadeDuration * 1000; // ms
    const steps = 60; // 60fps
    const stepDuration = duration / steps;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      crossfadeRef.current.progress = progress;

      // Fade out current, fade in next
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      const easeIn = Math.pow(progress, 3); // Cubic ease in

      fadeOutHowl.volume = 1 - easeOut;
      fadeInHowl.volume = easeIn;

      if (progress >= 1) {
        // Crossfade complete
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }

        fadeOutHowl.stop();
        fadeOutHowl.unload();

        // Switch to new track as main
        audio.switchTrack(nextTrack.track.id);
        crossfadeRef.current.isCrossfading = false;
        crossfadeRef.current.fadeOutTrack = null;

        // Preload next next track
        preloadNextTrack();
      }
    }, stepDuration);
  }, [crossfade, crossfadeDuration, queue, currentIndex, history, currentTrack, audio, preloadNextTrack]);

  // Check if we should start crossfade (near end of track)
  useEffect(() => {
    if (!crossfade || !isPlaying || !currentTrack) return;

    const checkPosition = () => {
      const position = audio.seek() as number;
      const duration = audio.duration() as number;

      if (duration > 0 && position > 0) {
        const remaining = duration - position;
        if (remaining <= crossfadeDuration && remaining > 0) {
          executeCrossfade();
        }
      }
    };

    const interval = setInterval(checkPosition, 500);
    return () => clearInterval(interval);
  }, [crossfade, isPlaying, currentTrack, crossfadeDuration, audio, executeCrossfade]);

  // Cleanup on unmount or crossfade disabled
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (nextTrackRef.current) {
        const { Howl } = require('howler');
        // Cleanup preloaded track
      }
    };
  }, []);

  // Public API
  const getCrossfadeState = useCallback(() => ({
    isCrossfading: crossfadeRef.current.isCrossfading,
    progress: crossfadeRef.current.progress,
    fadeOutTrack: crossfadeRef.current.fadeOutTrack,
    fadeInTrack: crossfadeRef.current.fadeInTrack,
  }), []);

  const cancelCrossfade = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (nextTrackRef.current) {
      nextTrackRef.current.pause();
      nextTrackRef.current.currentTime = 0;
      nextTrackRef.current = null;
    }

    crossfadeRef.current = {
      isCrossfading: false,
      fadeOutTrack: null,
      fadeInTrack: null,
      progress: 0,
    };
  }, []);

  return {
    getCrossfadeState,
    cancelCrossfade,
    preloadNextTrack,
  };
}