/**
 * Hub Music - Player Hook
 * Hook do player de áudio: reprodução, waveform, Howler.js, controle de mídia
 * Audio player hook: playback, waveform, Howler.js, media controls
 * 
 * @languages pt-BR / en-US
 */

import { createContext, useContext, useEffect, useRef, useState, ReactNode, useCallback } from 'react';
import { Howl, Howler } from 'howler';
import { useAuth } from './useAuth';
import { api } from '../lib/api';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  audioUrl: string;
  durationSeconds: number;
  waveformData?: number[];
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface PlayerContextType {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  play: (track: Track, queue?: Track[], index?: number) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');

  const howlRef = useRef<Howl | null>(null);
  const animationRef = useRef<number>();
  const isUserSeeking = useRef(false);

  // Initialize Howler
  useEffect(() => {
    Howler.volume(volume);
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update Howler volume
  useEffect(() => {
    Howler.volume(volume);
    if (howlRef.current) {
      howlRef.current.volume(volume);
    }
  }, [volume]);

  // Animation loop for progress
  const animate = useCallback(() => {
    if (howlRef.current && isPlaying && !isUserSeeking.current) {
      const seek = howlRef.current.seek() as number || 0;
      setCurrentTime(seek);
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Load and play track
  const loadTrack = useCallback((track: Track) => {
    if (howlRef.current) {
      howlRef.current.unload();
    }

    const howl = new Howl({
      src: [track.audioUrl],
      format: ['mp3', 'wav', 'ogg'],
      html5: true,
      preload: true,
      volume,
      onload: () => {
        setDuration(howl.duration());
      },
      onplay: () => {
        setIsPlaying(true);
      },
      onpause: () => {
        setIsPlaying(false);
      },
      onend: () => {
        handleTrackEnd();
      },
      onloaderror: (id, error) => {
        console.error('Audio load error:', error);
        // Try next track
        next();
      },
      onplayerror: (id, error) => {
        console.error('Audio play error:', error);
      }
    });

    howlRef.current = howl;
    howl.play();
  }, [volume]);

  const handleTrackEnd = useCallback(() => {
    if (repeat === 'one') {
      howlRef.current?.seek(0);
      howlRef.current?.play();
      return;
    }

    if (queueIndex < queue.length - 1) {
      next();
    } else if (repeat === 'all' && queue.length > 0) {
      // Loop to beginning
      setQueueIndex(0);
      loadTrack(queue[0]);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [queue, queueIndex, repeat, loadTrack]);

  const play = useCallback((track: Track, newQueue?: Track[], index?: number) => {
    if (newQueue) {
      setQueue(newQueue);
      setQueueIndex(index ?? 0);
    } else if (currentTrack?.id !== track.id) {
      // Add to queue if not already playing
      setQueue(prev => [...prev, track]);
      setQueueIndex(prev => prev + 1);
    }

    setCurrentTrack(track);
    loadTrack(track);
  }, [currentTrack, loadTrack]);

  const pause = useCallback(() => {
    howlRef.current?.pause();
  }, []);

  const togglePlay = useCallback(() => {
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.pause();
      } else {
        howlRef.current.play();
      }
    } else if (currentTrack) {
      loadTrack(currentTrack);
    }
  }, [isPlaying, currentTrack, loadTrack]);

  const next = useCallback(() => {
    if (queue.length === 0) return;

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    setQueueIndex(nextIndex);
    const nextTrack = queue[nextIndex];
    setCurrentTrack(nextTrack);
    loadTrack(nextTrack);
  }, [queue, queueIndex, shuffle, repeat, loadTrack]);

  const previous = useCallback(() => {
    if (queue.length === 0) return;

    let prevIndex: number;
    if (shuffle) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      prevIndex = queueIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }
    }

    setQueueIndex(prevIndex);
    const prevTrack = queue[prevIndex];
    setCurrentTrack(prevTrack);
    loadTrack(prevTrack);
  }, [queue, queueIndex, shuffle, loadTrack]);

  const seek = useCallback((time: number) => {
    if (howlRef.current) {
      isUserSeeking.current = true;
      howlRef.current.seek(time);
      setCurrentTime(time);
      // Allow seeking to settle
      setTimeout(() => {
        isUserSeeking.current = false;
      }, 100);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      if (index < queueIndex) {
        setQueueIndex(prev => prev - 1);
      } else if (index === queueIndex && !isPlaying) {
        // If removing current track and not playing, load next
        if (newQueue.length > 0) {
          const newIndex = Math.min(index, newQueue.length - 1);
          setQueueIndex(newIndex);
          setCurrentTrack(newQueue[newIndex]);
          loadTrack(newQueue[newIndex]);
        } else {
          setCurrentTrack(null);
          setQueueIndex(0);
        }
      }
      return newQueue;
    });
  }, [queueIndex, isPlaying, loadTrack]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setQueueIndex(0);
    if (howlRef.current) {
      howlRef.current.stop();
      howlRef.current.unload();
      howlRef.current = null;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  // Increment play count when track finishes
  useEffect(() => {
    if (currentTrack && !isPlaying && currentTime >= duration * 0.9 && duration > 0) {
      // Track finished playing (90% threshold)
      api.axios.post(`/tracks/${currentTrack.id}/play-count`).catch(console.error);
    }
  }, [currentTrack, isPlaying, currentTime, duration]);

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      queue,
      queueIndex,
      isPlaying,
      volume,
      currentTime,
      duration,
      play,
      pause,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      addToQueue,
      removeFromQueue,
      clearQueue,
      shuffle,
      repeat,
      toggleShuffle,
      toggleRepeat
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}