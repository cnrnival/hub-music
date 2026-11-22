/**
 * Hub Music - useKeyboardShortcuts Hook
 * Atalhos globais de teclado para player e navegação
 * Global keyboard shortcuts for player and navigation
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from '../../../state/playerStore';
import { useUIStore } from '../../../state/uiStore';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(enabled: boolean = true) {
  const player = usePlayerStore();
  const ui = useUIStore();

  const shortcutsRef = useRef<ShortcutMap>({});
  const inputFocusedRef = useRef(false);

  // Track input focus state
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      inputFocusedRef.current = target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;
    };

    const handleFocusOut = () => {
      inputFocusedRef.current = false;
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Register shortcuts
  const registerShortcuts = useCallback((map: ShortcutMap) => {
    shortcutsRef.current = { ...shortcutsRef.current, ...map };
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    delete shortcutsRef.current[key.toLowerCase()];
  }, []);

  // Main handler
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (inputFocusedRef.current) {
        // Except for global shortcuts like Escape
        if (e.key !== 'Escape' && e.key !== ' ') return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Build shortcut string
      let shortcut = '';
      if (ctrl) shortcut += 'ctrl+';
      if (shift) shortcut += 'shift+';
      if (alt) shortcut += 'alt+';
      shortcut += key;

      // Check exact match first
      if (shortcutsRef.current[shortcut]) {
        e.preventDefault();
        shortcutsRef.current[shortcut]();
        return;
      }

      // Check without modifiers for simple keys
      if (!ctrl && !shift && !alt && shortcutsRef.current[key]) {
        e.preventDefault();
        shortcutsRef.current[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  // Default player shortcuts
  useEffect(() => {
    registerShortcuts({
      ' ': () => player.togglePlay(),
      'k': () => player.togglePlay(),
      'arrowright': () => player.seekRelative(5),
      'l': () => player.seekRelative(5),
      'arrowleft': () => player.seekRelative(-5),
      'j': () => player.seekRelative(-5),
      'shift+arrowright': () => player.next(),
      'shift+n': () => player.next(),
      'shift+arrowleft': () => player.previous(),
      'shift+p': () => player.previous(),
      'arrowup': () => player.setVolume(Math.min(1, player.volume + 0.05)),
      'arrowdown': () => player.setVolume(Math.max(0, player.volume - 0.05)),
      'm': () => player.toggleMute(),
      's': () => player.toggleShuffle(),
      'r': () => player.toggleRepeat(),
      'q': () => ui.toggleQueuePanel(),
      'escape': () => {
        ui.closeAllModals();
        ui.setPipVisible(false);
      },
      'ctrl+arrowup': () => player.setVolume(Math.min(1, player.volume + 0.1)),
      'ctrl+arrowdown': () => player.setVolume(Math.max(0, player.volume - 0.1)),
      'ctrl+shift+arrowright': () => player.setPlaybackRate(Math.min(2, player.playbackRate + 0.1)),
      'ctrl+shift+arrowleft': () => player.setPlaybackRate(Math.max(0.5, player.playbackRate - 0.1)),
      'ctrl+shift+r': () => player.setPlaybackRate(1),
    });
  }, [player, ui, registerShortcuts]);

  return {
    registerShortcuts,
    unregisterShortcut,
  };
}

// Context-aware shortcuts for specific components
export function useComponentShortcuts(
  shortcuts: ShortcutMap,
  deps: React.DependencyList = []
) {
  const { registerShortcuts, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    registerShortcuts(shortcuts);
    return () => {
      Object.keys(shortcuts).forEach(unregisterShortcut);
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}