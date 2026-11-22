/**
 * Hub Music - Playlist Page
 * Página da playlist: detalhes, lista de faixas e reprodução em sequência
 * Playlist page: details, track list and sequential playback
 * 
 * @languages pt-BR / en-US
 */

import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlayer } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import { api } from '@/lib/api';
import { formatDuration, formatRelativeTime, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Repeat,
  Share2,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Music,
  User,
  Clock,
  Globe,
  Lock
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function PlaylistPage() {
  const { id } = useParams<{ id: string }>();
  const { play, currentTrack, isPlaying, currentTime, duration, togglePlay, next, previous, seek, volume, setVolume, queue, queueIndex } = usePlayer();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', description: '', visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: playlistData, isLoading, error, refetch } = useQuery({
    queryKey: ['playlist', id],
    queryFn: async () => {
      const response = await api.getPlaylist(id!);
      return response.data.playlist;
    },
    enabled: !!id
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: (data: any) => api.updatePlaylist(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      setEditing(false);
    }
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: () => api.deletePlaylist(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      window.history.back();
    }
  });

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => api.removeTrackFromPlaylist(id!, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (trackIds: string[]) => api.reorderPlaylistTracks(id!, trackIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
    }
  });

  const playlist = playlistData;
  const isOwner = user && playlist?.userId === user.id;
  const tracks = playlist?.tracks || [];

  // Initialize edit data
  useEffect(() => {
    if (playlist && !editing) {
      setEditData({
        name: playlist.name,
        description: playlist.description || '',
        visibility: playlist.visibility
      });
    }
  }, [playlist, editing]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex(t => t.track.id === active.id);
      const newIndex = tracks.findIndex(t => t.track.id === over?.id);
      const newTracks = Array.from(tracks);
      const [removed] = newTracks.splice(oldIndex, 1);
      newTracks.splice(newIndex, 0, removed);
      const trackIds = newTracks.map(t => t.track.id);
      reorderMutation.mutate(trackIds);
    }
  };

  if (isLoading) {
    return <PlaylistPageSkeleton />;
  }

  if (error || !playlist) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-heading-md font-bold mb-2">Playlist não encontrada</h2>
        <p className="text-text-secondary">Esta playlist pode ter sido removida ou não existe.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Playlist Header */}
      <div className="space-y-4">
        <div className="flex items-start gap-6">
          {/* Cover */}
          <div className="relative w-52 h-52 lg:w-64 lg:h-64 flex-shrink-0 rounded-2xl overflow-hidden">
            {playlist.coverUrl ? (
              <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
                <Music className="w-20 h-20 text-white/50" />
              </div>
            )}

            {/* Play button overlay */}
            <div className="absolute bottom-4 right-4">
              <Button size="lg" onClick={() => play(playlist.tracks[0]?.track, playlist.tracks.map(t => t.track), 0)} className="shadow-glow">
                <Play className="w-6 h-6 ml-0.5" />
              </Button>
            </div>

            {/* Visibility badge */}
            <div className="absolute top-4 left-4">
              <Badge variant={playlist.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-xs">
                {playlist.visibility === 'PUBLIC' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                {playlist.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-display-sm font-bold truncate">{playlist.name}</h1>
              {isOwner && !editing && (
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Editar">
                  <Edit className="w-5 h-5" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-4 text-text-secondary">
              <Avatar src={playlist.user?.avatarUrl} name={playlist.user?.displayName || playlist.user?.username} size="sm" />
              <span className="font-medium">{playlist.user?.displayName || playlist.user?.username}</span>
            </div>

            <div className="flex items-center gap-4 text-text-muted text-sm">
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                {tracks.length} faixa{tracks.length !== 1 ? 's' : ''}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(tracks.reduce((sum, t) => sum + (t.track.durationSeconds || 0), 0))}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(playlist.updatedAt)}
              </span>
            </div>

            {playlist.description && (
              <p className="text-text-secondary line-clamp-3">{playlist.description}</p>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={() => play(playlist.tracks[0]?.track, playlist.tracks.map(t => t.track), 0)} className="flex-1 sm:flex-none">
                <Play className="w-4 h-4 mr-2" />
                Reproduzir
              </Button>
              <Button variant="ghost" onClick={() => play(playlist.tracks[Math.floor(Math.random() * playlist.tracks.length)]?.track, playlist.tracks.map(t => t.track))}>
                <Repeat className="w-4 h-4 mr-2" />
                Aleatório
              </Button>
              {isOwner && (
                <>
                  <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="w-4 h-4 mr-2 text-error" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <Card className="p-4 space-y-4">
            <Input
              label="Nome da playlist"
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            />
            <Textarea
              label="Descrição"
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              rows={3}
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">Visibilidade</label>
              <select
                value={editData.visibility}
                onChange={(e) => setEditData({ ...editData, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}
                className="input"
              >
                <option value="PUBLIC">Público</option>
                <option value="PRIVATE">Privado</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button onClick={() => updatePlaylistMutation.mutate(editData)} disabled={updatePlaylistMutation.isPending}>
                {updatePlaylistMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Tracks List */}
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center">
          <div className="w-8 text-center text-text-muted text-sm font-medium">#</div>
          <div className="flex-1 min-w-0 px-3 text-text-muted text-sm font-medium">TÍTULO</div>
          <div className="w-40 text-center text-text-muted text-sm font-medium hidden md:block">ARTISTA</div>
          <div className="w-24 text-center text-text-muted text-sm font-medium">ÁLBUM</div>
          <div className="w-20 text-right text-text-muted text-sm font-medium pr-4">DURAÇÃO</div>
          {isOwner && <div className="w-12 text-center text-text-muted text-sm font-medium">AÇÕES</div>}
        </div>

        {/* Tracks */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tracks.map(t => t.track.id)}
            strategy={verticalListSortingStrategy}
          >
            {tracks.map((item, index) => (
              <PlaylistTrackRow
                key={item.track.id}
                track={item.track}
                position={index + 1}
                isOwner={isOwner}
                isCurrentTrack={currentTrack?.id === item.track.id}
                isPlaying={isCurrentTrack && isPlaying}
                currentTime={isCurrentTrack ? currentTime : 0}
                duration={duration || item.track.durationSeconds}
                onPlay={() => play(item.track, tracks.map(t => t.track), index)}
                onRemove={() => removeTrackMutation.mutate(item.track.id)}
                id={item.track.id}
              />
            ))}
          </SortableContext>
        </DndContext>

        {tracks.length === 0 && (
          <div className="p-12 text-center text-text-muted">
            <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary mb-4">Esta playlist está vazia</p>
            <Button variant="ghost" size="sm">Adicionar músicas</Button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 space-y-4 text-center">
            <h2 className="text-heading-sm font-bold">Excluir playlist</h2>
            <p className="text-text-secondary">Tem certeza que deseja excluir "{playlist.name}"? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={() => deletePlaylistMutation.mutate()} className="flex-1">
                Excluir
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function PlaylistTrackRow({
  track,
  position,
  isOwner,
  isCurrentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onRemove,
  id
}: {
  track: any;
  position: number;
  isOwner: boolean;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onRemove: () => void;
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-4 px-4 py-3 border-b border-border/30 hover:bg-background-hover transition-colors',
        isCurrentTrack && 'bg-primary/5'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary cursor-grab active:cursor-grabbing rounded-lg hover:bg-background-tertiary"
        aria-label="Reordenar"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-8 text-center text-text-secondary text-sm font-medium flex-shrink-0">
        {isCurrentTrack && isPlaying ? (
          <span className="text-primary animate-pulse">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="4" height="12" />
              <rect x="7" y="5" width="4" height="6" />
              <rect x="12" y="2" width="4" height="12" />
            </svg>
          </span>
        ) : (
          position
        )}
      </div>

      <div className="flex-1 min-w-0 px-3">
        <button
          onClick={onPlay}
          className="w-full flex items-center gap-3 text-left"
        >
          {track.coverUrl ? (
            <img src={track.coverUrl} alt={track.title} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary-light/20 flex items-center justify-center flex-shrink-0">
              <Music className="w-5 h-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-medium text-text-primary truncate">{track.title}</p>
            <p className="text-text-secondary text-sm truncate">{track.artist}</p>
          </div>
        </button>
      </div>

      <div className="w-40 text-center text-text-secondary text-sm hidden md:block truncate">
        {track.user?.displayName || track.user?.username}
      </div>

      <div className="w-24 text-center text-text-muted text-sm truncate">
        {track.album || '—'}
      </div>

      <div className="w-20 text-right text-text-muted text-sm font-mono pr-4">
        {formatDuration(track.durationSeconds)}
      </div>

      {isOwner && (
        <div className="w-12 text-center">
          <button
            onClick={onRemove}
            className="p-1 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
            aria-label="Remover da playlist"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function PlaylistPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="flex items-start gap-6">
        <div className="w-52 h-52 lg:w-64 lg:h-64 rounded-2xl bg-background-tertiary" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-background-tertiary rounded w-1/2" />
          <div className="h-5 bg-background-tertiary rounded w-1/3" />
          <div className="h-4 bg-background-tertiary rounded w-full" />
        </div>
      </div>
      <div className="bg-card rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/30">
            <div className="w-8" />
            <div className="w-10 h-10 rounded-lg bg-background-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-background-tertiary rounded w-3/4" />
              <div className="h-3 bg-background-tertiary rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Textarea } from '../components/ui/input';