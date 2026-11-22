/**
 * Hub Music - QueuePanel
 * Painel lateral de fila: Up Next + History
 * Side queue panel: Up Next + History
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { cn, formatDuration } from '@/lib/utils';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  History,
  MoreVertical,
  Play,
  Heart,
  Plus,
  Trash2,
  Music,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { usePlayerStore } from '@/state/playerStore';

export function QueuePanel() {
  const {
    queue,
    history,
    currentIndex,
    currentTrack,
    isPlaying,
    removeFromQueue,
    moveQueueItem,
    clearQueue,
    playNext,
    playLater,
    queuePanelOpen,
    toggleQueuePanel,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'upnext' | 'history'>('upnext');

  if (!queuePanelOpen) return null;

  const upNextTracks = queue.slice(currentIndex + 1);
  const currentQueueTrack = queue[currentIndex];

  return (
    <div className="fixed top-0 right-0 z-50 h-full w-96 bg-background border-l border-border flex flex-col animate-slide-in-right" id="queue-panel" role="region" aria-label="Fila de reprodução">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleQueuePanel} aria-label="Fechar fila">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-bold text-heading-sm">Fila de reprodução</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'upnext' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-tertiary'
            )}
            onClick={() => setActiveTab('upnext')}
          >
            <ListMusic className="w-4 h-4 inline mr-1" /> Próximas ({upNextTracks.length})
          </button>
          <button
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === 'history' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-tertiary'
            )}
            onClick={() => setActiveTab('history')}
          >
            <History className="w-4 h-4 inline mr-1" /> Histórico ({history.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'upnext' ? (
          <>
            {/* Current playing */}
            {(currentQueueTrack || currentTrack) && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Tocando agora</p>
                <QueueTrackItem
                  track={currentQueueTrack?.track || currentTrack!}
                  isCurrent={true}
                  isPlaying={isPlaying}
                  onPlay={() => {}}
                  onRemove={() => {}}
                  showActions={false}
                />
              </div>
            )}

            {/* Up next */}
            <div>
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Próximas</p>
                {upNextTracks.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearQueue} className="text-error">
                    <Trash2 className="w-3 h-3 mr-1" /> Limpar
                  </Button>
                )}
              </div>

              {upNextTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
                  <Music className="w-12 h-12 mb-3 opacity-50" />
                  <p className="font-medium">Fila vazia</p>
                  <p className="text-sm mt-1">Adicione músicas para tocar em seguida</p>
                </div>
              ) : (
                <ul className="space-y-1" role="list">
                  {upNextTracks.map((queuedTrack, index) => (
                    <QueueTrackItem
                      key={queuedTrack.id}
                      track={queuedTrack.track}
                      queueIndex={currentIndex + 1 + index}
                      isCurrent={false}
                      onPlay={() => {}}
                      onRemove={() => removeFromQueue(currentIndex + 1 + index)}
                      onMoveUp={index > 0 ? () => moveQueueItem(currentIndex + 1 + index, currentIndex + index) : undefined}
                      onMoveDown={index < upNextTracks.length - 1 ? () => moveQueueItem(currentIndex + 1 + index, currentIndex + 2 + index) : undefined}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          /* History tab */
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">Histórico</p>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-text-muted">
                <History className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">Nenhum histórico</p>
                <p className="text-sm mt-1">Músicas tocadas aparecerão aqui</p>
              </div>
            ) : (
              <ul className="space-y-1" role="list">
                {history.map((queuedTrack, index) => (
                  <QueueTrackItem
                    key={queuedTrack.id}
                    track={queuedTrack.track}
                    queueIndex={index}
                    isCurrent={false}
                    isHistory={true}
                    onPlay={() => {}}
                    onRemove={() => {}}
                    showActions={false}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Clear queue button at bottom if queue not empty */}
      {queue.length > 0 && (
        <div className="p-4 border-t border-border">
          <Button variant="secondary" className="w-full" onClick={clearQueue}>
            <Trash2 className="w-4 h-4 mr-2" /> Limpar fila
          </Button>
        </div>
      )}
    </div>
  );
}

interface QueueTrackItemProps {
  track: any;
  queueIndex?: number;
  isCurrent?: boolean;
  isPlaying?: boolean;
  isHistory?: boolean;
  onPlay: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showActions?: boolean;
}

function QueueTrackItem({ track, queueIndex, isCurrent, isPlaying, isHistory, onPlay, onRemove, onMoveUp, onMoveDown, showActions = true }: QueueTrackItemProps) {
  return (
    <li className="group relative">
      <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-background-tertiary transition-colors">
        <div className="relative w-10 h-10 flex-shrink-0 rounded-lg overflow-hidden">
          {track.coverUrl ? (
            <img src={track.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-dark/30 flex items-center justify-center">
              <Music className="w-5 h-5 text-white/50" />
            </div>
          )}
          {isCurrent && isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '100ms' }} />
                <div className="w-1 h-4 bg-primary animate-pulse" style={{ animationDelay: '200ms' }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn('font-medium truncate', isCurrent ? 'text-primary' : 'text-text-primary')}>{track.title}</p>
          <p className="text-caption text-text-secondary truncate">{track.artist}</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {showActions && !isHistory && (
            <>
              {onMoveUp && (
                <Button variant="ghost" size="icon" onClick={onMoveUp} aria-label="Mover para cima" className="text-text-muted hover:text-text-primary">
                  <ChevronLeft className="w-4 h-4 rotate-90" />
                </Button>
              )}
              {onMoveDown && (
                <Button variant="ghost" size="icon" onClick={onMoveDown} aria-label="Mover para baixo" className="text-text-muted hover:text-text-primary">
                  <ChevronLeft className="w-4 h-4 -rotate-90" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-text-muted hover:text-text-primary" aria-label="Mais opções">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPlay}><Play className="w-4 h-4 mr-2" /> Tocar agora</DropdownMenuItem>
                  <DropdownMenuItem><Heart className="w-4 h-4 mr-2" /> Curtir</DropdownMenuItem>
                  <DropdownMenuItem><Plus className="w-4 h-4 mr-2" /> Adicionar à playlist</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error" onClick={onRemove}><Trash2 className="w-4 h-4 mr-2" /> Remover da fila</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {isCurrent && !isHistory && (
            <span className="text-xs font-medium text-primary px-2 py-0.5 bg-primary/10 rounded-full">Tocando</span>
          )}
        </div>
      </div>
    </li>
  );
}