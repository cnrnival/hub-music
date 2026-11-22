/**
 * Hub Music - Comment Section Component
 * Componente Comentários: seção de comentários com timestamp
 * Comment Section component: comment section with timestamps
 * 
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatRelativeTime } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MessageSquare, Send, Trash2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface CommentSectionProps {
  trackId: string;
  initialComments?: any[];
  initialTotal?: number;
}

export function CommentSection({ trackId, initialComments = [], initialTotal = 0 }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['track', trackId, 'comments', page],
    queryFn: async () => {
      const response = await api.getComments(trackId, { page, limit: 20 });
      return response.data;
    },
    initialData: {
      comments: initialComments,
      pagination: { page: 1, limit: 20, total: initialTotal, totalPages: Math.ceil(initialTotal / 20) }
    },
    placeholderData: (previousData) => previousData
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => api.addComment(trackId, content),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['track', trackId, 'comments', 1] });
      const previous = queryClient.getQueryData(['track', trackId, 'comments', 1]);
      const optimisticComment = {
        id: `temp-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        user: user,
        userId: user?.id
      };
      queryClient.setQueryData(['track', trackId, 'comments', 1], (old: any) => ({
        ...old,
        comments: [optimisticComment, ...(old?.comments || [])],
        pagination: { ...old?.pagination, total: (old?.pagination?.total || 0) + 1 }
      }));
      return { previous };
    },
    onError: (err, _, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['track', trackId, 'comments', 1], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['track', trackId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({ queryKey: ['track', trackId, 'comments', page] });
      const previous = queryClient.getQueryData(['track', trackId, 'comments', page]);
      queryClient.setQueryData(['track', trackId, 'comments', page], (old: any) => ({
        ...old,
        comments: old?.comments?.filter((c: any) => c.id !== commentId) || [],
        pagination: { ...old?.pagination, total: Math.max(0, (old?.pagination?.total || 1) - 1) }
      }));
      return { previous };
    },
    onError: (err, _, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['track', trackId, 'comments', page], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['track', trackId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment.trim());
    setNewComment('');
  };

  const handleDelete = (commentId: string) => {
    if (window.confirm('Excluir este comentário?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const loadMore = () => {
    if (commentsData && page < commentsData.pagination.totalPages) {
      setLoadingMore(true);
      setPage(prev => prev + 1);
      // Small delay to show loading state
      setTimeout(() => setLoadingMore(false), 300);
    }
  };

  const comments = commentsData?.comments || [];
  const total = commentsData?.pagination?.total || 0;

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      {user && (
        <div className="flex gap-3">
          <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="md" />
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                rows={2}
                className="w-full rounded-xl bg-background-tertiary border border-border px-4 py-3 text-text-primary placeholder-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                maxLength={280}
              />
              <div className="flex items-center justify-between">
                <span className={cn('text-xs', newComment.length > 250 ? 'text-warning' : 'text-text-muted')}>
                  {newComment.length}/280
                </span>
                <Button type="submit" size="sm" disabled={!newComment.trim() || addCommentMutation.isPending}>
                  <Send className="w-4 h-4 mr-1" />
                  Comentar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading && comments.length === 0 ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <CommentSkeleton key={i} />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum comentário ainda. Seja o primeiro!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isOwner={user?.id === comment.userId || user?.id === comment.track?.userId}
                onDelete={handleDelete}
                deleting={deleteCommentMutation.isPending && deleteCommentMutation.variables === comment.id}
              />
            ))}

            {/* Load More */}
            {commentsData && page < commentsData.pagination.totalPages && (
              <Button variant="ghost" className="w-full" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Carregando...' : `Carregar mais (${commentsData.pagination.total - comments.length} restantes)`}
              </Button>
            )}
          </>
        )}

        {/* Total Count */}
        {total > 0 && comments.length > 0 && (
          <p className="text-text-muted text-sm text-center">
            {comments.length} de {total} comentário{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, isOwner, onDelete, deleting }: { comment: any; isOwner: boolean; onDelete: (id: string) => void; deleting: boolean }) {
  return (
    <div className="flex gap-3 group">
      <Avatar src={comment.user?.avatarUrl} name={comment.user?.displayName || comment.user?.username} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-text-primary truncate">{comment.user?.displayName || comment.user?.username}</p>
          <span className="text-text-muted text-sm whitespace-nowrap">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="text-text-secondary whitespace-pre-wrap">{comment.content}</p>
        {isOwner && (
          <button
            onClick={() => onDelete(comment.id)}
            disabled={deleting}
            className="text-text-muted hover:text-error text-sm mt-1 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-background-tertiary" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-background-tertiary rounded w-1/4" />
        <div className="h-3 bg-background-tertiary rounded w-3/4" />
      </div>
    </div>
  );
}