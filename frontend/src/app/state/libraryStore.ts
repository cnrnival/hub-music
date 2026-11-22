/**
 * Hub Music - Library Store (Zustand)
 * Estado da biblioteca: aba ativa, modo de visualização, ordenação, filtros
 * Library state: active tab, view mode, sort, filters
 *
 * @languages pt-BR / en-US
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type LibraryTab = 'tracks' | 'albums' | 'artists' | 'playlists' | 'episodes' | 'recents';
export type ViewMode = 'grid' | 'list';
export type SortOption = 'recent' | 'alphabetical' | 'artist' | 'duration' | 'popularity';
export type FilterSource = 'all' | 'local' | 'deezer' | 'freetouse' | 'jamendo' | 'soundcloud';

export interface LibraryFilters {
  genre?: string;
  source?: FilterSource;
  search?: string;
}

export interface LibraryState {
  // Active state
  activeTab: LibraryTab;
  viewMode: ViewMode;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  filters: LibraryFilters;

  // Per-tab persistence
  tabViewModes: Record<LibraryTab, ViewMode>;
  tabSortOptions: Record<LibraryTab, SortOption>;
  tabFilters: Record<LibraryTab, LibraryFilters>;

  // Actions
  setActiveTab: (tab: LibraryTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setFilters: (filters: Partial<LibraryFilters>) => void;
  clearFilters: () => void;

  // Per-tab getters
  getViewMode: (tab: LibraryTab) => ViewMode;
  getSortBy: (tab: LibraryTab) => SortOption;
  getFilters: (tab: LibraryTab) => LibraryFilters;
}

const DEFAULT_TAB_VIEW_MODES: Record<LibraryTab, ViewMode> = {
  tracks: 'grid',
  albums: 'grid',
  artists: 'grid',
  playlists: 'grid',
  episodes: 'grid',
  recents: 'list',
};

const DEFAULT_TAB_SORT_OPTIONS: Record<LibraryTab, SortOption> = {
  tracks: 'recent',
  albums: 'recent',
  artists: 'alphabetical',
  playlists: 'recent',
  episodes: 'recent',
  recents: 'recent',
};

const DEFAULT_FILTERS: LibraryFilters = {
  genre: undefined,
  source: 'all',
  search: '',
};

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTab: 'tracks',
      viewMode: 'grid',
      sortBy: 'recent',
      sortOrder: 'desc',
      filters: DEFAULT_FILTERS,
      tabViewModes: DEFAULT_TAB_VIEW_MODES,
      tabSortOptions: DEFAULT_TAB_SORT_OPTIONS,
      tabFilters: {
        tracks: DEFAULT_FILTERS,
        albums: DEFAULT_FILTERS,
        artists: DEFAULT_FILTERS,
        playlists: DEFAULT_FILTERS,
        episodes: DEFAULT_FILTERS,
        recents: DEFAULT_FILTERS,
      },

      // Actions
      setActiveTab: (tab) => {
        const state = get();
        set({
          activeTab: tab,
          viewMode: state.tabViewModes[tab] || 'grid',
          sortBy: state.tabSortOptions[tab] || 'recent',
          filters: state.tabFilters[tab] || DEFAULT_FILTERS,
        });
      },

      setViewMode: (mode) => {
        const tab = get().activeTab;
        set({
          viewMode: mode,
          tabViewModes: { ...get().tabViewModes, [tab]: mode },
        });
      },

      setSortBy: (sort) => {
        const tab = get().activeTab;
        set({
          sortBy: sort,
          tabSortOptions: { ...get().tabSortOptions, [tab]: sort },
        });
      },

      setSortOrder: (order) => set({ sortOrder: order }),

      setFilters: (filters) => {
        const tab = get().activeTab;
        const newFilters = { ...get().filters, ...filters };
        set({
          filters: newFilters,
          tabFilters: { ...get().tabFilters, [tab]: newFilters },
        });
      },

      clearFilters: () => {
        const tab = get().activeTab;
        set({
          filters: DEFAULT_FILTERS,
          tabFilters: { ...get().tabFilters, [tab]: DEFAULT_FILTERS },
        });
      },

      // Per-tab getters
      getViewMode: (tab) => get().tabViewModes[tab] || 'grid',
      getSortBy: (tab) => get().tabSortOptions[tab] || 'recent',
      getFilters: (tab) => get().tabFilters[tab] || DEFAULT_FILTERS,
    }),
    {
      name: 'hubmusic:library',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeTab: state.activeTab,
        tabViewModes: state.tabViewModes,
        tabSortOptions: state.tabSortOptions,
        tabFilters: state.tabFilters,
      }),
    }
  )
);