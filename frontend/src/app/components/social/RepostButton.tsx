/**
 * Hub Music - RepostButton
 * Botão de repost com atualização otimista
 * Repost button with optimistic update
 *
 * @languages pt-BR / en-US
 */

import { Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../../lib/utils';

interface RepostButtonProps {
  isReposted: boolean;
  count: number;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ariaLabel?: string;
}

export function RepostButton({
  isReposted,
  count,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
  ariaLabel,
}: RepostButtonProps) {
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
      variant={isReposted ? 'secondary' : 'outline'}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        buttonSizeClasses[size],
        'transition-all duration-200',
        isReposted && 'text-primary border-primary/50 bg-primary/10',
        className
      )}
      aria-label={ariaLabel || (isReposted ? 'Remover repost' : 'Repostar')}
      aria-pressed={isReposted}
    >
      <Share2
        className={cn(
          iconSizeClasses[size],
          'transition-all duration-200',
          isReposted && 'text-primary'
        )}
        aria-hidden="true"
      />
      {showCount && (
        <span className={cn(
          'font-medium tabular-nums transition-all duration-200',
          isReposted && 'text-primary'
        )}>
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>
      )}
    </Button>
  );
}