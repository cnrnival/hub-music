/**
 * Hub Music - PanelSection
 * Layout raiz: Sidebar + Main + NowPlayingBar + PIP + QueuePanel
 * Root layout: Sidebar + Main + NowPlayingBar + PIP + QueuePanel
 *
 * @languages pt-BR / en-US
 */

import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { NowPlayingBar } from './NowPlayingBar';
import { PipMiniPlayer } from './PipMiniPlayer';
import { QueuePanel } from './QueuePanel';
import { usePlayerStore } from '../state/playerStore';
import { useUIStore } from '../state/uiStore';
import { initializePlayerSnapshot } from '../hooks/player/usePlayerSnapshot';

export function PanelSection() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { pipVisible, pipPosition, pipSize } = usePlayerStore();
  const { modals, toasts } = useUIStore();

  // Initialize player snapshot on mount
  useEffect(() => {
    initializePlayerSnapshot();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onToggleCollapse={setSidebarCollapsed}
        onCloseMobile={mobileSidebarOpen ? () => setMobileSidebarOpen(false) : undefined}
      />

      {/* Main content area */}
      <main
        className={`
          flex-1 flex flex-col overflow-hidden transition-all duration-300
          lg:ml-64 ${sidebarCollapsed ? 'lg:ml-16' : ''}
        `}
      >
        {/* Top Bar */}
        <TopBar
          onMenuClick={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      {/* Now Playing Bar (persistent bottom) */}
      <NowPlayingBar />

      {/* PIP Mini Player */}
      {pipVisible && (
        <PipMiniPlayer
          position={pipPosition}
          size={pipSize}
          onPositionChange={(pos) => usePlayerStore.getState().setPipPosition(pos)}
          onSizeChange={(size) => usePlayerStore.getState().setPipSize(size)}
          onClose={() => usePlayerStore.getState().togglePip()}
        />
      )}

      {/* Queue Panel */}
      <QueuePanel />

      {/* Modals stack */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        {modals.map((modal) => (
          <div key={modal.id} className="pointer-events-auto" style={{ zIndex: 50 + modal.zIndex }}>
            {modal.content}
          </div>
        ))}
      </div>

      {/* Toasts */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-slide-in-right"
            style={{ maxWidth: '360px' }}
          >
            {toast.content}
          </div>
        ))}
      </div>
    </div>
  );
}