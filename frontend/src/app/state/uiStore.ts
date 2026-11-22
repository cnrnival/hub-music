/**
 * Hub Music - UI Store (Zustand)
 * Estado global da UI: modals, toasts, sidebar, PIP, command palette
 * Global UI state: modals, toasts, sidebar, PIP, command palette
 *
 * @languages pt-BR / en-US
 */

import { create } from 'zustand';

interface Modal {
  id: string;
  content: React.ReactNode;
  zIndex: number;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

interface Toast {
  id: string;
  content: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;

  // PIP
  pipVisible: boolean;
  pipPosition: { x: number; y: number };
  pipSize: 'mini' | 'compact' | 'full';
  setPipVisible: (visible: boolean) => void;
  setPipPosition: (pos: { x: number; y: number }) => void;
  setPipSize: (size: 'mini' | 'compact' | 'full') => void;

  // Modals stack
  modals: Modal[];
  openModal: (content: React.ReactNode, options?: { closeOnOverlayClick?: boolean; closeOnEscape?: boolean }) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  // Toasts
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Queue panel
  queuePanelOpen: boolean;
  setQueuePanelOpen: (open: boolean) => void;
  toggleQueuePanel: () => void;

  // Lyrics panel
  lyricsPanelOpen: boolean;
  setLyricsPanelOpen: (open: boolean) => void;
  toggleLyricsPanel: () => void;

  // Device picker
  devicePickerOpen: boolean;
  setDevicePickerOpen: (open: boolean) => void;
  toggleDevicePicker: () => void;
}

let modalZIndex = 100;
let toastId = 0;

export const useUIStore = create<UIState>((set, get) => ({
  // Sidebar
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // PIP
  pipVisible: false,
  pipPosition: { x: 20, y: window.innerHeight - 200 },
  pipSize: 'compact',
  setPipVisible: (visible) => set({ pipVisible: visible }),
  setPipPosition: (pos) => set({ pipPosition: pos }),
  setPipSize: (size) => set({ pipSize: size }),

  // Modals
  modals: [],
  openModal: (content, options = {}) => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const zIndex = modalZIndex++;
    set((state) => ({
      modals: [...state.modals, { id, content, zIndex, ...options }],
    }));
    return id;
  },
  closeModal: (id) => set((state) => ({ modals: state.modals.filter((m) => m.id !== id) })),
  closeAllModals: () => set({ modals: [] }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastId}-${Date.now()}`;
    const duration = toast.duration ?? 4000;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
    return id;
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),

  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Queue panel
  queuePanelOpen: false,
  setQueuePanelOpen: (open) => set({ queuePanelOpen: open }),
  toggleQueuePanel: () => set((state) => ({ queuePanelOpen: !state.queuePanelOpen })),

  // Lyrics panel
  lyricsPanelOpen: false,
  setLyricsPanelOpen: (open) => set({ lyricsPanelOpen: open }),
  toggleLyricsPanel: () => set((state) => ({ lyricsPanelOpen: !state.lyricsPanelOpen })),

  // Device picker
  devicePickerOpen: false,
  setDevicePickerOpen: (open) => set({ devicePickerOpen: open }),
  toggleDevicePicker: () => set((state) => ({ devicePickerOpen: !state.devicePickerOpen })),
}));