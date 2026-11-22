/**
 * Hub Music - CommentInput
 * Input de comentário com suporte a timestamp
 * Comment input with timestamp support
 *
 * @languages pt-BR / en-US
 */

import { useState } from 'react';
import { Clock, Send, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDuration } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  onSubmit: (content: string, timestamp?: number) => void;
  currentTime?: number;
  duration?: number;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export function CommentInput({
  onSubmit,
  currentTime = 0,
  duration = 0,
  placeholder = 'Adicione um comentário...',
  maxLength = 280,
  className,
}: CommentInputProps) {
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

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-2', className)}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-background-secondary border border-border-primary rounded-lg px-4 py-2 text-text-primary placeholder-text-muted resize-none focus:border-primary focus:outline-none transition-colors"
            rows={2}
            maxLength={maxLength}
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {timestamp !== null && (
                <Badge variant="outline" className={cn('gap-1 text-[10px] flex items-center')}>
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(timestamp)}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0.5"
                    onClick={() => setTimestamp(null)}
                    aria-label="Remover timestamp"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              )}
              <span className={cn('text-text-muted text-sm', text.length > maxLength * 0.9 && 'text-warning')}>
                {text.length}/{maxLength}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setTimestamp(currentTime)}
                disabled={duration === 0}
                className="gap-1"
                aria-label={`Marcar tempo atual: ${formatTimestamp(currentTime)}`}
              >
                <Clock className="w-4 h-4" />
                Marcar tempo
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!text.trim()}
                className="gap-1"
              >
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

import { User } from 'lucide-react';