/**
 * Hub Music - useQueue Hook
 * Gerenciamento avançado de fila de reprodução
 * Advanced playback queue management
 *
 * @languages pt-BR / en-US
 */

import { useCallback, useMemo } from 'react';
import { usePlayerStore } from '@/state/playerStore';
import type { Track } from '../../../types/api';

interface QueuedTrack {
  id: string;
  track: Track;
  source: 'local' | 'deezer' | 'freetouse' | 'jamendo' | 'soundcloud' | 'radio';
  addedAt: number;
  addedBy?: 'user' | 'autoplay' | 'radio';
}

export function useQueue() {
  const {
    queue,
    history,
    currentIndex,
    currentTrack,
    addToQueue,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    playNext,
    playLater,
    setQueue,
    setHistory,
    setCurrentIndex,
  } = usePlayerStore();

  // Combined queue: history (reversed) + current + queue
  const fullQueue = useMemo(() => {
    const historyReversed = [...history].reverse();
    const current = currentTrack ? [{ track: currentTrack, id: 'current', source: 'local' as const, addedAt: Date.now() }] : [];
    return [...historyReversed, ...current, ...queue];
  }, [history, currentTrack, queue]);

  // Add track(s) to queue
  const enqueue = useCallback((
    tracks: Track | Track[],
    position: 'next' | 'end' = 'end',
    source: QueuedTrack['source'] = 'local'
  ) => {
    const trackArray = Array.isArray(tracks) ? tracks : [tracks];
    addToQueue(trackArray, position, source);
  }, [addToQueue]);

  // Add to play next (insert after current)
  const enqueueNext = useCallback((tracks: Track | Track[], source: QueuedTrack['source'] = 'local') => {
    enqueue(tracks, 'next', source);
  }, [enqueue]);

  // Add to play later (insert at end of queue)
  const enqueueLater = useCallback((tracks: Track | Track[], source: QueuedTrack['source'] = 'local') => {
    enqueue(tracks, 'end', source);
  }, [enqueue]);

  // Remove item from queue by index (relative to queue array)
  const dequeue = useCallback((queueIndex: number) => {
    removeFromQueue(queueIndex);
  }, [removeFromQueue]);

  // Move item within queue
  const reorder = useCallback((fromIndex: number, toIndex: number) => {
    moveQueueItem(fromIndex, toIndex);
  }, [moveQueueItem]);

  // Clear entire queue
  const clear = useCallback(() => {
    clearQueue();
  }, [clearQueue]);

  // Play specific track from queue
  const playFromQueue = useCallback((queueIndex: number) => {
    setCurrentIndex(history.length + 1 + queueIndex);
  }, [history.length, setCurrentIndex]);

  // Play from history
  const playFromHistory = useCallback((historyIndex: number) => {
    setCurrentIndex(history.length - 1 - historyIndex);
  }, [history.length, setCurrentIndex]);

  // Get queue item by index
  const getQueueItem = useCallback((index: number) => {
    return queue[index];
  }, [queue]);

  // Get history item by index (0 = most recent)
  const getHistoryItem = useCallback((index: number) => {
    return history[history.length - 1 - index];
  }, [history]);

  // Check if track is in queue
  const isInQueue = useCallback((trackId: string) => {
    return queue.some(item => item.track.id === trackId);
  }, [queue]);

  // Check if track is in history
  const isInHistory = useCallback((trackId: string) => {
    return history.some(item => item.track.id === trackId);
  }, [history]);

  // Get next track without advancing
  const peekNext = useCallback(() => {
    if (queue.length > 0) return queue[0];
    return null;
  }, [queue]);

  // Get previous track without going back
  const peekPrevious = useCallback(() => {
    if (history.length > 0) return history[history.length - 1];
    return null;
  }, [history]);

  // Queue statistics
  const stats = useMemo(() => ({
    queueLength: queue.length,
    historyLength: history.length,
    totalDuration: queue.reduce((acc, item) => acc + (item.track.duration || 0), 0),
    sources: queue.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [queue, history]);

  return {
    // State
    queue,
    history,
    fullQueue,
    currentIndex,
    currentTrack,

    // Actions
    enqueue,
    enqueueNext,
    enqueueLater,
    dequeue,
    reorder,
    clear,
    playFromQueue,
    playFromHistory,

    // Queries
    getQueueItem,
    getHistoryItem,
    isInQueue,
    isInHistory,
    peekNext,
    peekPrevious,

    // Stats
    stats,
  };
}