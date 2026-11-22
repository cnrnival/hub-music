/**
 * Hub Music - MiniWaveform
 * Waveform miniatura baseada em Canvas para NowPlayingBar/PIP
 * Canvas-based mini waveform for NowPlayingBar/PIP
 *
 * @languages pt-BR / en-US
 */

import { useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MiniWaveformProps {
  peaks: number[];
  duration: number;
  progress: number;
  onSeek: (seconds: number) => void;
  waveColor?: string;
  progressColor?: string;
  height?: number;
  className?: string;
}

export function MiniWaveform({
  peaks,
  duration,
  progress,
  onSeek,
  waveColor = '#FF4081',
  progressColor = '#FF80AB',
  height = 40,
  className,
}: MiniWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const isDraggingRef = useRef(false);

  // Downsample peaks for mini waveform
  const downsampledPeaks = useMemo(() => {
    if (peaks.length === 0) return [];
    const targetWidth = 300; // approximate canvas width
    const ratio = peaks.length / targetWidth;
    if (ratio <= 1) return peaks;

    const downsampled: number[] = [];
    for (let i = 0; i < targetWidth; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.floor((i + 1) * ratio);
      let max = 0;
      for (let j = start; j < end; j++) {
        if (peaks[j] > max) max = peaks[j];
      }
      downsampled.push(max);
    }
    return downsampled;
  }, [peaks]);

  // Draw waveform
  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const canvasHeight = height;

    // Set canvas size
    canvas.width = width * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, width, canvasHeight);

    if (downsampledPeaks.length === 0) return;

    const barWidth = Math.max(1, (width / downsampledPeaks.length) * 0.8);
    const barGap = Math.max(0.5, (width / downsampledPeaks.length) * 0.2);
    const centerY = canvasHeight / 2;
    const maxBarHeight = canvasHeight * 0.9;

    // Draw bars
    downsampledPeaks.forEach((peak, i) => {
      const x = i * (barWidth + barGap) + barGap / 2;
      const barHeight = peak * maxBarHeight;
      const y = centerY - barHeight / 2;

      // Progress color
      const progressX = (progress / duration) * width;
      const isProgress = x < progressX;

      ctx.fillStyle = isProgress ? progressColor : waveColor;
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    // Draw cursor
    const cursorX = (progress / duration) * width;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cursorX - 1, 0, 2, canvasHeight);
  };

  // Animation loop for progress updates
  useEffect(() => {
    const animate = () => {
      drawWaveform();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [progress, duration, downsampledPeaks, waveColor, progressColor]);

  // Handle click/drag to seek
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    handleSeek(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDraggingRef.current) {
      handleSeek(e);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const seekProgress = Math.max(0, Math.min(1, x / width));
    const seekSeconds = seekProgress * duration;
    onSeek(seekSeconds);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const step = duration / 100; // 1% per key press
    let newProgress = progress;

    switch (e.key) {
      case 'ArrowLeft':
        newProgress = Math.max(0, progress - step);
        break;
      case 'ArrowRight':
        newProgress = Math.min(duration, progress + step);
        break;
      case 'Home':
        newProgress = 0;
        break;
      case 'End':
        newProgress = duration;
        break;
      default:
        return;
    }

    e.preventDefault();
    onSeek(newProgress);
  };

  return (
    <canvas
      ref={canvasRef}
      className={cn('w-full cursor-pointer select-none', className)}
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label="Mini waveform"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={progress}
      aria-orientation="horizontal"
    />
  );
}