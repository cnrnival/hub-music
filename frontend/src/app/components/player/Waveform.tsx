/**
 * Hub Music - Waveform
 * Wrapper do Wavesurfer.js para waveform interativo
 * Wavesurfer.js wrapper for interactive waveform
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveformProps {
  peaks: number[];
  duration: number;
  progress: number;
  isPlaying: boolean;
  onSeek: (seconds: number) => void;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  height?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  className?: string;
}

interface WaveformRef {
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

export const Waveform = forwardRef<WaveformRef, WaveformProps>(
  (
    {
      peaks,
      duration,
      progress,
      isPlaying,
      onSeek,
      waveColor = '#FF4081',
      progressColor = '#FF80AB',
      cursorColor = '#FFFFFF',
      height = 128,
      barWidth = 2,
      barGap = 1,
      barRadius = 1,
      className,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<WaveSurfer | null>(null);
    const isDraggingRef = useRef(false);
    const animationFrameRef = useRef<number>();

    // Initialize Wavesurfer
    useEffect(() => {
      if (!containerRef.current || wavesurferRef.current) return;

      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor,
        progressColor,
        cursorColor,
        cursorWidth: 1,
        height,
        barWidth,
        barGap,
        barRadius,
        interact: true,
        hideScrollbar: true,
        normalize: true,
        backend: 'WebAudio',
        mediaControls: false,
        responsive: true,
      });

      // Load peaks
      if (peaks.length > 0) {
        ws.load('', peaks);
      }

      // Set duration
      ws.setDuration(duration);

      // Seek on click
      ws.on('seek', (newProgress: number) => {
        if (!isDraggingRef.current) {
          const seconds = newProgress * duration;
          onSeek(seconds);
        }
      });

      // Drag events
      ws.on('drag', () => {
        isDraggingRef.current = true;
      });

      ws.on('dragend', (newProgress: number) => {
        isDraggingRef.current = false;
        const seconds = newProgress * duration;
        onSeek(seconds);
      });

      // Ready event
      ws.on('ready', () => {
        ws.seekTo(progress / duration);
      });

      wavesurferRef.current = ws;

      return () => {
        ws.destroy();
        wavesurferRef.current = null;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [peaks, duration, waveColor, progressColor, cursorColor, height, barWidth, barGap, barRadius]);

    // Update progress
    useEffect(() => {
      if (!wavesurferRef.current || isDraggingRef.current) return;

      const ws = wavesurferRef.current;
      const targetProgress = progress / duration;

      if (Math.abs(ws.getCurrentTime() / duration - targetProgress) > 0.01) {
        ws.seekTo(targetProgress);
      }
    }, [progress, duration]);

    // Update play state
    useEffect(() => {
      if (!wavesurferRef.current) return;

      const ws = wavesurferRef.current;
      if (isPlaying && ws.isPaused()) {
        ws.play();
      } else if (!isPlaying && !ws.isPaused()) {
        ws.pause();
      }
    }, [isPlaying]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      play: () => wavesurferRef.current?.play(),
      pause: () => wavesurferRef.current?.pause(),
      seek: (seconds: number) => wavesurferRef.current?.seekTo(seconds / duration),
      setVolume: (volume: number) => wavesurferRef.current?.setVolume(volume),
      destroy: () => {
        wavesurferRef.current?.destroy();
        wavesurferRef.current = null;
      },
    }));

    return (
      <div
        ref={containerRef}
        className={cn('w-full', className)}
        style={{ height }}
        role="slider"
        aria-label="Waveform do áudio"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={progress}
        tabIndex={0}
      />
    );
  }
);

Waveform.displayName = 'Waveform';

import { cn } from '@/lib/utils';