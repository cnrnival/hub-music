/**
 * Hub Music - PlaylistEditor
 * Editor de playlist com drag-drop (@dnd-kit)
 * Playlist editor with drag-drop (@dnd-kit)
 *
 * @languages pt-BR / en-US
 */

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Pause, Heart, Share2, MoreHorizontal, ChevronLeft, ChevronRight,
  Music, User, Calendar, ListMusic, Heart as HeartIcon, Edit, Trash2,
  Download, Plus, X, GripVertical, Save, ArrowLeft, Image, Camera
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Badge } from '@/ui/badge';
import { Avatar } from '@/ui/avatar';
import { Input } from '@/ui/input';
import { Textarea } from '@/ui/textarea';
import { ScrollArea } from '@/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { Separator } from '@/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/ui/dialog';
import { Label } from '@/ui/label';
import { Switch } from '@/ui/switch';
import { TrackRow } from '@/components/track/TrackRow';
import { TrackSkeleton } from '@/components/track/TrackSkeleton';
import { usePlayerStore } from '@/state/playerStore';
import { usePlaylist, usePlaylistTracks, useCreatePlaylist, useUpdatePlaylist, useAddPlaylistTracks, useRemovePlaylistTracks, useReorderPlaylistTracks, useUploadPlaylistCover } from '@/hooks/data/usePlaylists';
import { useSearch } from '@/hooks/data/useSearch';
import { formatDuration, formatNumber } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Drag and drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PlaylistTrack {
  id: string;
  track: any;
  position: number;
  addedAt: string;
}

interface PlaylistEditorProps {
  playlistId?: string;
}

export function PlaylistEditor({ playlistId: propPlaylistId }: PlaylistEditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlistId = propPlaylistId || id;
  const isNew = !playlistId || playlistId === 'create';

  // Player state
  const { play } = usePlayerStore();

  // Local state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE' | 'UNLISTED'>('PUBLIC');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Data fetching
  const { data: playlist, isLoading: playlistLoading } = usePlaylist(playlistId || '', { enabled: !!playlistId && !isNew });
  const { mutate: createPlaylist } = useCreatePlaylist();
  const { mutate: updatePlaylist } = useUpdatePlaylist();
  const { mutate: addTracks } = useAddPlaylistTracks();
  const { mutate: removeTracks } = useRemovePlaylistTracks();
  const { mutate: reorderTracks } = useReorderPlaylistTracks();
  const { mutate: uploadCover } = useUploadPlaylistCover();
  const { unifiedSearch } = useSearch();

  // Load existing playlist data
  useEffect(() => {
    if (playlist && !isNew) {
      setName(playlist.name);
      setDescription(playlist.description || '');
      setVisibility(playlist.visibility);
      if (playlist.coverUrl) setCoverPreview(playlist.coverUrl);
      if (playlist.tracks) {
        setTracks(playlist.tracks.map((t: any, i: number) => ({
          id: t.id,
          track: t.track || t,
          position: t.position ?? i,
          addedAt: t.addedAt || new Date().toISOString(),
        })));
      }
    }
  }, [playlist, isNew]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tracks.findIndex(t => t.id === active.id);
      const newIndex = tracks.findIndex(t => t.id === over.id);

      const newTracks = arrayMove(tracks, oldIndex, newIndex);
      setTracks(newTracks);

      // Update positions
      const updatedTracks = newTracks.map((t, i) => ({ ...t, position: i }));

      if (!isNew && playlistId) {
        reorderTracks({
          playlistId,
          trackIds: updatedTracks.map(t => t.track.id),
        });
      }
    }

    setActiveId(null);
  }, [tracks, isNew, playlistId, reorderTracks]);

  // Handle cover upload
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A capa deve ter no máximo 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('O arquivo deve ser uma imagem');
        return;
      }
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchQuery(query);
    try {
      const results = await unifiedSearch(query, { limit: 20, types: ['track'] });
      setSearchResults(results.tracks || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    }
  }, [unifiedSearch]);

  // Add track to playlist
  const handleAddTrack = (track: any) => {
    const exists = tracks.some(t => t.track.id === track.id);
    if (exists) return;

    const newTrack: PlaylistTrack = {
      id: `temp-${Date.now()}`,
      track,
      position: tracks.length,
      addedAt: new Date().toISOString(),
    };
    setTracks([...tracks, newTrack]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Remove track from playlist
  const handleRemoveTrack = (trackId: string) => {
    setTracks(tracks.filter(t => t.id !== trackId));
  };

  // Save playlist
  const handleSave = async () => {
    if (!name.trim()) {
      alert('O nome da playlist é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        // Create new playlist
        createPlaylist(
          {
            name,
            description,
            visibility,
            coverFile: coverFile || undefined,
          },
          {
            onSuccess: (data: any) => {
              // Add tracks after creation
              if (tracks.length > 0) {
                addTracks({
                  playlistId: data.id,
                  trackIds: tracks.map(t => t.track.id),
                });
              }
              navigate(`/playlist/${data.id}`);
            },
          }
        );
      } else {
        // Update existing playlist
        updatePlaylist(
          { id: playlistId, name, description, visibility },
          {
            onSuccess: () => {
              if (coverFile) {
                uploadCover({ playlistId: playlistId!, file: coverFile });
              }
              // Sync tracks
              const currentTrackIds = tracks.map(t => t.track.id);
              // TODO: Compare with server and add/remove/reorder
              navigate(`/playlist/${playlistId}`);
            },
          }
        );
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Sortable Track Item Component
  const SortableTrackItem = ({ track: trackData }: { track: PlaylistTrack }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: trackData.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group"
      >
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-3 p-2 rounded-xl transition-colors hover:bg-background-tertiary cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-text-muted flex-shrink-0" aria-label="Arrastar para reordenar" />
          <TrackRow
            track={trackData.track}
            number={trackData.position + 1}
            variant="compact"
            onPlay={() => play({ type: 'track', trackId: trackData.track.id })}
            showPlaylist={false}
          />
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveTrack(trackData.id);
            }}
            aria-label="Remover da playlist"
          >
            <X className="w-4 h-4 text-error" />
          </Button>
        </div>
      </div>
    );
  };

  if (playlistLoading && !isNew) {
    return (
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-6">
          <div className="h-8 bg-background-tertiary rounded w-1/3" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <TrackSkeleton key={i} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalDuration = tracks.reduce((acc, t) => acc + (t.track.duration || 0), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <ScrollArea className="h-full">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Voltar">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-text-primary">
              {isNew ? 'Nova playlist' : 'Editar playlist'}
            </h1>
            <div className="w-10" />
          </div>

          {/* Cover Upload */}
          <div className="flex items-start gap-6">
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 rounded-xl overflow-hidden bg-background-tertiary border-2 border-dashed border-border-primary relative">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Capa da playlist"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                    <Image className="w-12 h-12 mb-2" />
                    <span className="text-sm">Clique para adicionar capa</span>
                  </div>
                )}
                <label className="absolute inset-0 cursor-pointer" htmlFor="cover-upload">
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
                {coverPreview && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    aria-label="Remover capa"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex-1 min-w-0 space-y-4">
              <div>
                <Label htmlFor="playlist-name" className="block text-sm font-medium text-text-secondary mb-1">
                  Nome da playlist *
                </Label>
                <Input
                  id="playlist-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da playlist"
                  className="text-lg"
                  maxLength={100}
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="playlist-description" className="block text-sm font-medium text-text-secondary mb-1">
                  Descrição
                </Label>
                <Textarea
                  id="playlist-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição..."
                  rows={3}
                  maxLength={500}
                  className="resize-none"
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-text-secondary mb-1">
                  Visibilidade
                </Label>
                <div className="flex gap-4">
                  {(['PUBLIC', 'PRIVATE', 'UNLISTED'] as const).map((vis) => (
                    <label key={vis} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value={vis}
                        checked={visibility === vis}
                        onChange={() => setVisibility(vis)}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        'px-4 py-2 rounded-lg border-2 transition-colors',
                        visibility === vis
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border-primary text-text-secondary hover:border-primary/50'
                      )}>
                        {vis === 'PUBLIC' && 'Público'}
                        {vis === 'PRIVATE' && 'Privado'}
                        {vis === 'UNLISTED' && 'Não listado'}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search & Add Tracks */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Adicionar músicas</h2>
              <span className="text-text-muted text-sm">{tracks.length} faixas • {formatDuration(totalDuration)}</span>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                placeholder="Buscar músicas para adicionar..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                className="pl-11 pr-11"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
                  onClick={() => { setSearchQuery(''); handleSearch(''); }}
                  aria-label="Limpar busca"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="bg-background-tertiary/50 rounded-xl border border-border-primary max-h-64 overflow-y-auto mb-4">
                <div className="px-4 py-2 border-b border-border-primary flex items-center justify-between">
                  <span className="text-text-secondary text-sm">Resultados da busca</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowSearchResults(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => handleAddTrack(track)}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-background-secondary transition-colors text-left border-b border-border-primary/50 last:border-b-0"
                    >
                      {track.coverUrl ? (
                        <img src={track.coverUrl} alt="" className="w-10 h-10 rounded-lg object-cover" loading="lazy" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-background-secondary flex items-center justify-center">
                          <Music className="w-5 h-5 text-text-muted" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">{track.title}</p>
                        <p className="text-text-secondary text-sm truncate">{track.artist?.displayName || track.artist?.username}</p>
                      </div>
                      <Plus className="w-5 h-5 text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Tracklist with Drag & Drop */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-text-primary">Faixas da playlist</h2>
              {tracks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTracks([])}
                  className="text-error hover:text-error/80"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar tudo
                </Button>
              )}
            </div>

            {tracks.length === 0 ? (
              <div className="text-center py-12 bg-background-tertiary/50 rounded-xl border border-dashed border-border-primary">
                <GripVertical className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                <h3 className="font-medium text-text-primary mb-2">Nenhuma faixa adicionada</h3>
                <p className="text-text-secondary mb-4">Busque músicas acima e clique em + para adicionar</p>
                <p className="text-text-muted text-sm">Arraste e solte para reordenar</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={tracks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {tracks.map((track) => (
                      <SortableTrackItem key={track.id} track={track} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>

          {/* Save Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-primary">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isNew ? 'Criar playlist' : 'Salvar alterações'}
                </>
              )}
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

import { Search, Loader2 } from 'lucide-react';export default PlaylistEditor;
