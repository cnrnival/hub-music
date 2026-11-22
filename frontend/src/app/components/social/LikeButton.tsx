/**
 * Hub Music - LikeButton
 * Botão de curtir com atualização otimista
 * Like button with optimistic update
 *
 * @languages pt-BR / en-US
 */

import { Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  isLiked: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export function LikeButton({
  isLiked,
  count,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
  ariaLabel,
}: LikeButtonProps) {
  const buttonSizeClasses = {
    sm: 'h-8 px-2 gap-1 text-xs',
    md: 'h-10 px-3 gap-1.5 text-sm',
    lg: 'h-12 px-4 gap-2 text-base',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const showCount = variant !== 'icon-only';

  return (
    <Button
      variant={isLiked ? 'secondary' : 'outline'}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        buttonSizeClasses[size],
        'transition-all duration-200',
        isLiked && 'text-error border-error/50 bg-error/10',
        className
      )}
      aria-label={ariaLabel || (isLiked ? 'Descurtir' : 'Curtir')}
      aria-pressed={isLiked}
    >
      <Heart
        className={cn(
          iconSizeClasses[size],
          'transition-all duration-200',
          isLiked && 'fill-current text-error animate-pulse'
        )}
        aria-hidden="true"
      />
      {showCount && (
        <span className={cn(
          'font-medium tabular-nums transition-all duration-200',
          isLiked && 'text-error'
        )}>
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </Button>
  );
}