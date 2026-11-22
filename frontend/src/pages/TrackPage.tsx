/**
 * Hub Music - Track Page
 * Página da faixa: detalhes, reprodução e interações sociais
 * Track page: details, playback and social interactions
 * 
 * @languages pt-BR / en-US
 */

import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePlayer } from '../hooks/usePlayer';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Waveform } from '../components/player/Waveform';
import { formatDuration, formatRelativeTime, formatNumber, getErrorMessage } from '../lib/utils';
import { cn } from '../lib/utils';
import { Avatar } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/input';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Repeat,
  Share2,
  MoreHorizontal,
  MessageSquare,
  User,
  Clock,
  Globe,
  Lock,
  Trash2,
  Edit,
  Download
} from 'lucide-react';
import { useState } from 'react';

export function TrackPage() {
  const { id } = useParams<{ id: string }>();
  const { play, currentTrack, isPlaying, currentTime, duration, togglePlay, next, previous, seek, volume, setVolume, queue, queueIndex } = usePlayer();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', artist: '', description: '', visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' });

  const { data: trackData, isLoading, error, refetch } = useQuery({
    queryKey: ['track', id],
    queryFn: async () => {
      const response = await api.getTrack(id!);
      return response.data.track;
    },
    enabled: !!id
  });

  const { data: waveformData } = useQuery({
    queryKey: ['track', id, 'waveform'],
    queryFn: async () => {
      const response = await api.getWaveform(id!);
      return response.data.peaks;
    },
    enabled: !!id
  });

  const { data: commentsData } = useQuery({
    queryKey: ['track', id, 'comments'],
    queryFn: async () => {
      const response = await api.getComments(id!);
      return response.data;
    },
    enabled: !!id
  });

  const likeMutation = useMutation({
    mutationFn: () => api.toggleLike(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', id] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });

  const repostMutation = useMutation({
    mutationFn: () => api.toggleRepost(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', id] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.addComment(id!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', id, 'comments'] });
      setNewComment('');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', id, 'comments'] });
    }
  });

  const updateTrackMutation = useMutation({
    mutationFn: (data: any) => api.updateTrack(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', id] });
      setEditing(false);
    }
  });

  const deleteTrackMutation = useMutation({
    mutationFn: () => api.deleteTrack(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      window.history.back();
    }
  });

  const track = trackData;
  const peaks = waveformData || track?.waveformData || [];
  const isOwner = user && track?.userId === user.id;
  const canEdit = isOwner;

  if (isLoading) {
    return <TrackPageSkeleton />;
  }

  if (error || !track) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-background-tertiary flex items-center justify-center mb-4">
          <Music className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-heading-md font-bold mb-2">Faixa não encontrada</h2>
        <p className="text-text-secondary">Esta faixa pode ter sido removida ou não existe.</p>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Cover */}
      <div className="relative">
        <div className="aspect-video w-full rounded-2xl overflow-hidden">
          {track.coverUrl ? (
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center">
              <Music className="w-24 h-24 text-white/50" />
            </div>
          )}
        </div>

        {/* Play button overlay */}
        <div className="absolute bottom-4 right-4">
          <Button size="lg" onClick={() => play(track)} className="shadow-glow">
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </Button>
        </div>

        {/* Source badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="primary" className="text-xs">
            {track.source === 'LOCAL' ? 'Hub Music' : track.source}
          </Badge>
        </div>

        {/* Visibility badge */}
        <div className="absolute top-4 right-4">
          <Badge variant={track.visibility === 'PUBLIC' ? 'success' : 'warning'} className="text-xs">
            {track.visibility === 'PUBLIC' ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
            {track.visibility === 'PUBLIC' ? 'Público' : 'Privado'}
          </Badge>
        </div>
      </div>

      {/* Track Info */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-display-sm font-bold truncate">{track.title}</h1>
              {track.explicit && <Badge variant="error" size="sm">Explícito</Badge>}
            </div>
            <p className="text-text-secondary text-lg mb-2">
              <Avatar src={track.user?.avatarUrl} name={track.user?.displayName || track.user?.username} size="sm" className="mr-2" />
              <span className="font-medium">{track.user?.displayName || track.user?.username}</span>
              {track.artist !== (track.user?.displayName || track.user?.username) && (
                <> · <span>{track.artist}</span></>
              )}
            </p>
            <div className="flex items-center gap-4 text-text-muted text-sm">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(track.durationSeconds)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {formatNumber(track._count?.likes || 0)}
              </span>
              <span className="flex items-center gap-1">
                <Repeat className="w-4 h-4" />
                {formatNumber(track._count?.reposts || 0)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {formatNumber(track._count?.comments || 0)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatRelativeTime(track.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {canEdit && (
              <>
                <Button variant="ghost" size="icon" onClick={() => setEditing(true)} aria-label="Editar">
                  <Edit className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteTrackMutation.mutate()} aria-label="Excluir">
                  <Trash2 className="w-5 h-5 text-error" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" aria-label="Mais opções">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {track.description && (
          <p className="text-text-secondary line-clamp-3">{track.description}</p>
        )}

        {track.genre && (
          <Badge variant="secondary" className="text-sm">{track.genre.name}</Badge>
        )}
      </div>

      {/* Waveform Player */}
      <div className="space-y-3">
        <Waveform
          peaks={peaks}
          duration={duration || track.durationSeconds}
          currentTime={isCurrentTrack ? currentTime : 0}
          onSeek={seek}
          height={100}
        />

        {/* Player Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={previous}
              aria-label="Anterior"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button
              onClick={togglePlay}
              className="w-14 h-14 rounded-full bg-primary text-white shadow-glow hover:shadow-glow-lg"
              aria-label={isCurrentTrack && isPlaying ? 'Pausar' : 'Reproduzir'}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause className="w-7 h-7" />
              ) : (
                <Play className="w-7 h-7 ml-1" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={next}
              aria-label="Próxima"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => likeMutation.mutate()}
              className={cn(track.userLiked && 'text-error')}
              aria-label={track.userLiked ? 'Descurtir' : 'Curtir'}
              aria-pressed={track.userLiked}
            >
              <Heart className={cn('w-5 h-5', track.userLiked && 'fill-current')} />
              <span className="hidden sm:inline">{formatNumber(track._count?.likes || 0)}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => repostMutation.mutate()}
              className={cn(track.userReposted && 'text-primary')}
              aria-label={track.userReposted ? 'Remover repost' : 'Repostar'}
              aria-pressed={track.userReposted}
            >
              <Repeat className="w-5 h-5" />
              <span className="hidden sm:inline">{formatNumber(track._count?.reposts || 0)}</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className={cn(showComments && 'text-primary')}
              aria-label={showComments ? 'Ocultar comentários' : 'Mostrar comentários'}
              aria-expanded={showComments}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">{formatNumber(track._count?.comments || 0)}</span>
            </Button>
          </div>
        </div>

        {/* Progress & Volume */}
        <div className="flex items-center gap-4 text-text-muted text-caption font-mono">
          <span className="w-10 text-right">{formatDuration(isCurrentTrack ? currentTime : 0)}</span>
          <div className="flex-1 h-1 bg-background-tertiary rounded-full relative">
            <div
              className="h-full bg-primary rounded-full transition-all duration-100"
              style={{ width: `${duration > 0 ? (isCurrentTrack ? currentTime : 0) / duration * 100 : 0}%` }}
            />
          </div>
          <span className="w-10">{formatDuration(duration || track.durationSeconds)}</span>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <Card className="space-y-4">
          <h2 className="text-heading-sm font-bold">Comentários ({track._count?.comments || 0})</h2>

          {/* Add Comment */}
          {user && (
            <div className="flex gap-3">
              <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="md" />
              <div className="flex-1">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicione um comentário..."
                  rows={2}
                  className="mb-2"
                />
                <Button size="sm" onClick={() => commentMutation.mutate(newComment)} disabled={!newComment.trim()}>
                  Comentar
                </Button>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {commentsData?.comments?.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={user?.id === comment.userId || user?.id === track.userId}
                onDelete={deleteCommentMutation.mutate}
              />
            ))}

            {(!commentsData?.comments || commentsData.comments.length === 0) && (
              <div className="text-center py-8 text-text-muted">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum comentário ainda. Seja o primeiro!</p>
              </div>
            )}

            {/* Load more */}
            {commentsData?.pagination && commentsData.pagination.page < commentsData.pagination.totalPages && (
              <Button variant="ghost" className="w-full" onClick={() => {}}>
                Carregar mais
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      {editing && (
        <EditTrackModal
          track={track}
          editData={editData}
          setEditData={setEditData}
          onSave={() => updateTrackMutation.mutate(editData)}
          onCancel={() => setEditing(false)}
          saving={updateTrackMutation.isPending}
        />
      )}
    </div>
  );
}

function CommentItem({ comment, isOwner, onDelete }: { comment: any; isOwner: boolean; onDelete: (id: string) => void }) {
  return (
    <div className="flex gap-3 group">
      <Avatar src={comment.user?.avatarUrl} name={comment.user?.displayName || comment.user?.username} size="sm" />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-text-primary">{comment.user?.displayName || comment.user?.username}</p>
          <span className="text-text-muted text-sm">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-text-secondary">{comment.content}</p>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-text-muted hover:text-error text-sm mt-1 transition-colors"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}

function EditTrackModal({ track, editData, setEditData, onSave, onCancel, saving }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-heading-sm font-bold">Editar faixa</h2>
          <button onClick={onCancel} className="p-1 text-text-muted hover:text-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <Input
          label="Título"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
        />

        <Input
          label="Artista"
          value={editData.artist}
          onChange={(e) => setEditData({ ...editData, artist: e.target.value })}
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
          <Button variant="secondary" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={saving} className="flex-1">
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function TrackPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="aspect-video w-full rounded-2xl bg-background-tertiary" />
      <div className="space-y-4">
        <div className="h-8 bg-background-tertiary rounded w-1/2" />
        <div className="h-5 bg-background-tertiary rounded w-1/3" />
        <div className="h-4 bg-background-tertiary rounded w-full" />
      </div>
      <div className="h-24 bg-background-tertiary rounded-xl" />
      <div className="flex items-center gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-12 h-12 rounded-full bg-background-tertiary" />
        ))}
      </div>
    </div>
  );
}

import { Music, X } from 'lucide-react';