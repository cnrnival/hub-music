/**
 * Hub Music - CommentSection
 * Seção de comentários com timestamp (estilo SoundCloud)
 * Comment section with timestamp (SoundCloud style)
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { Clock, Heart, MoreHorizontal, Flag, Reply, Send, Check, MessageSquare, X } from 'lucide-react';
import { Button } from '@/ui/button';
import { Avatar } from '@/ui/avatar';
import { Badge } from '@/ui/badge';
import { ScrollArea } from '@/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';
import { Input } from '@/ui/input';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  content: string;
  timestamp?: number; // seconds
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
  replyTo?: string;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string, timestamp?: number) => void;
  onLikeComment: (commentId: string) => void;
  onReplyComment: (commentId: string, content: string) => void;
  onReportComment: (commentId: string) => void;
  currentTime?: number; // current playback position
  duration?: number;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function CommentSection({
  comments,
  onAddComment,
  onLikeComment,
  onReplyComment,
  onReportComment,
  currentTime = 0,
  duration = 0,
  isLoading = false,
  hasMore = false,
  onLoadMore,
}: CommentSectionProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSubmitReply = (commentId: string) => {
    if (replyText.trim()) {
      onReplyComment(commentId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={cn(
        'flex gap-3 animate-slide-in',
        depth > 0 && 'ml-8 border-l-2 border-border-primary pl-4'
      )}
    >
      <Avatar
        src={comment.user.avatarUrl}
        name={comment.user.displayName || comment.user.username}
        size="sm"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-0 font-medium text-text-primary hover:text-primary"
            onClick={() => {}} // navigate to profile
          >
            {comment.user.displayName || comment.user.username}
          </Button>
          {comment.user.verified && <Check className="w-3 h-3 text-primary" />}
          {comment.timestamp !== undefined && (
            <Tooltip content={`Timestamp: ${formatTimestamp(comment.timestamp)}`}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-auto px-1 text-text-muted hover:text-primary"
                  onClick={() => {}} // seek to timestamp
                >
                  <Clock className="w-4 h-4" />
                  {formatTimestamp(comment.timestamp)}
                </Button>
              </TooltipTrigger>
            </Tooltip>
          )}
          <span className="text-text-muted text-sm">{formatRelativeTime(comment.createdAt)}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-1 ml-auto" aria-label="Mais opções">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onLikeComment(comment.id)}>
                <Heart className={cn('w-4 h-4 mr-2', comment.isLiked && 'fill-current text-error')} />
                {comment.isLiked ? 'Descurtir' : 'Curtir'} ({comment.likes})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReplyingTo(comment.id)}>
                <Reply className="w-4 h-4 mr-2" />
                Responder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error" onClick={() => onReportComment(comment.id)}>
                <Flag className="w-4 h-4 mr-2" />
                Denunciar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-text-secondary mb-2">{comment.content}</p>

        {/* Reply Input */}
        {replyingTo === comment.id && (
          <div className="flex gap-2 mt-2">
            <Input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escreva uma resposta..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmitReply(comment.id)}
              autoFocus
            />
            <Button variant="primary" size="sm" onClick={() => handleSubmitReply(comment.id)}>
              <Send className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              Cancelar
            </Button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}

        {comment.replies && comment.replies.length > 3 && (
          <Button variant="ghost" size="sm" className="mt-2 text-text-muted hover:text-primary">
            Ver mais {comment.replies.length - 3} respostas
          </Button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-8 h-8 rounded-full bg-background-tertiary" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-background-tertiary rounded w-1/4" />
              <div className="h-4 bg-background-tertiary rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {comments.length > 0 ? (
          comments.map((comment) => renderComment(comment))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-text-muted" />
            <h3 className="font-medium text-text-primary mb-2">Nenhum comentário ainda</h3>
            <p className="text-text-secondary">Seja o primeiro a comentar!</p>
          </div>
        )}
      </div>

      {/* Load More */}
      {hasMore && (
        <Button variant="outline" className="w-full" onClick={onLoadMore}>
          Carregar mais comentários
        </Button>
      )}

      {/* Add Comment Form */}
      <div className="border-t border-border-primary pt-6">
        <CommentInput
          onSubmit={onAddComment}
          currentTime={currentTime}
          duration={duration}
        />
      </div>
    </div>
  );
}


interface CommentInputProps {
  onSubmit: (content: string, timestamp?: number) => void;
  currentTime?: number;
  duration?: number;
}

function CommentInput({ onSubmit, currentTime = 0, duration = 0 }: CommentInputProps) {
  const [text, setText] = useState('');
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim(), timestamp || undefined);
      setText('');
      setTimestamp(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <Avatar src={null} name="Você" size="sm" />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Adicione um comentário..."
            className="w-full bg-background-secondary border border-border-primary rounded-lg px-4 py-2 text-text-primary placeholder-text-muted resize-none focus:border-primary focus:outline-none"
            rows={2}
            maxLength={280}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {timestamp !== null && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(timestamp)}
                  <Button variant="ghost" size="icon" className="p-0.5" onClick={() => setTimestamp(null)}>
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              <span className="text-text-muted text-sm">{text.length}/280</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTimestamp(currentTime)}
                disabled={duration === 0}
                className="gap-1"
              >
                <Clock className="w-4 h-4" />
                Marcar tempo
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={!text.trim()}>
                <Send className="w-4 h-4" />
                Comentar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

import { X } from 'lucide-react';