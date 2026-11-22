/**
 * Hub Music - usePlayerSnapshot Hook
 * Persistência/restauração do estado do player no localStorage/IndexedDB
 * Persist/restore player state to localStorage/IndexedDB
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useCallback } from 'react';
import { usePlayerStore } from '../../state/playerStore';
import type { PlayerSnapshot, SNAPSHOT_STORAGE_KEY, SNAPSHOT_VERSION, SNAPSHOT_MAX_AGE } from '../../types/player';

const STORAGE_KEY = SNAPSHOT_STORAGE_KEY;
const VERSION = SNAPSHOT_VERSION;
const MAX_AGE = SNAPSHOT_MAX_AGE;

export function usePlayerSnapshot() {
  const { snapshot, restore, queue, history, currentTrack, currentIndex, position, volume, playbackRate, repeatMode, shuffle, crossfade, pipVisible, pipPosition, pipSize } = usePlayerStore();

  // Restore on mount (before first paint)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as PlayerSnapshot;

        // Validate version and age
        if (parsed.version === VERSION && Date.now() - parsed.timestamp < MAX_AGE) {
          // Only restore if we have valid data
          if (parsed.queue && parsed.queue.length > 0 && parsed.currentIndex >= 0) {
            restore(parsed);
          }
        } else {
          // Clear invalid/old snapshot
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to restore player snapshot:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [restore]);

  // Persist on changes (debounced 1s)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const snap = snapshot();
        // Only persist if we have meaningful state
        if (snap.queue.length > 0 || snap.currentTrack) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
        }
      } catch (error) {
        // Quota exceeded or serialization error
        console.warn('Failed to persist player snapshot:', error);
      }
    }, 1000);

    return () => clearTimeout(id);
  }, [
    queue,
    history,
    currentTrack,
    currentIndex,
    position,
    volume,
    playbackRate,
    repeatMode,
    shuffle,
    crossfade,
    pipVisible,
    pipPosition,
    pipSize,
    snapshot,
  ]);

  // Clear snapshot on explicit logout/reset
  const clearSnapshot = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { clearSnapshot };
}

// Initialize snapshot restoration (call early in app)
export function initializePlayerSnapshot() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as PlayerSnapshot;
      if (parsed.version === VERSION && Date.now() - parsed.timestamp < MAX_AGE) {
        if (parsed.queue && parsed.queue.length > 0 && parsed.currentIndex >= 0) {
          // Use the store's restore method directly
          usePlayerStore.getState().restore(parsed);
        }
      }
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}