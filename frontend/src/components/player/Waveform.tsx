/**
 * Hub Music - Waveform Component
 * Componente Waveform: visualização de forma de onda com Wavesurfer.js
 * Waveform component: waveform visualization with Wavesurfer.js
 * 
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useMemo } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { cn } from '../../lib/utils';

interface WaveformProps {
  peaks: number[];
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  playedColor?: string;
  progressColor?: string;
  cursorColor?: string;
  height?: number;
  className?: string;
}

export function Waveform({
  peaks,
  duration,
  currentTime,
  onSeek,
  playedColor = '#FF4081',
  progressColor = '#FF4081',
  cursorColor = '#FF4081',
  height = 80,
  className
}: WaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isUserInteracting = useRef(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!containerRef.current || wavesurferRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(255, 64, 129, 0.3)',
      progressColor,
      cursorColor,
      cursorWidth: 2,
      height,
      barWidth: 2,
      barGap: 1,
      barRadius: 1,
      fillParent: true,
      interact: true,
      normalize: true,
      minPxPerSec: 20,
      pixelRatio: window.devicePixelRatio || 1,
      backend: 'WebAudio',
      mediaControls: false
    });

    wavesurferRef.current = wavesurfer;

    // Load peaks data
    wavesurfer.load('', peaks);

    // Handle seek on click
    wavesurfer.on('seek', (progress: number) => {
      if (isUserInteracting.current) {
        const time = progress * duration;
        onSeek(time);
      }
    });

    wavesurfer.on('interaction', () => {
      isUserInteracting.current = true;
    });

    wavesurfer.on('finish', () => {
      isUserInteracting.current = false;
    });

    return () => {
      wavesurfer.destroy();
      wavesurferRef.current = null;
    };
  }, [peaks, duration, progressColor, cursorColor, height, onSeek]);

  // Update progress
  useEffect(() => {
    if (wavesurferRef.current && !isUserInteracting.current && duration > 0) {
      const progress = currentTime / duration;
      wavesurferRef.current.seekTo(progress);
    }
  }, [currentTime, duration]);

  const progress = useMemo(() => duration > 0 ? currentTime / duration : 0, [currentTime, duration]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full select-none', className)}
      role="slider"
      aria-label="Waveform progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (!duration) return;
        let newTime = currentTime;
        const step = duration * 0.05; // 5% steps
        switch (e.key) {
          case 'ArrowRight':
            e.preventDefault();
            newTime = Math.min(duration, currentTime + step);
            break;
          case 'ArrowLeft':
            e.preventDefault();
            newTime = Math.max(0, currentTime - step);
            break;
          case 'Home':
            e.preventDefault();
            newTime = 0;
            break;
          case 'End':
            e.preventDefault();
            newTime = duration;
            break;
        }
        if (newTime !== currentTime) {
          isUserInteracting.current = true;
          onSeek(newTime);
        }
      }}
      onKeyUp={() => {
        isUserInteracting.current = false;
      }}
    />
  );
}