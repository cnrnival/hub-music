/**
 * Hub Music - FollowButton
 * Botão de seguir com estados: Follow/Following/Requested
 * Follow button with states: Follow/Following/Requested
 *
 * @languages pt-BR / en-US
 */

import { UserPlus, UserCheck, UserX, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../../lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

type FollowState = 'follow' | 'following' | 'requested' | 'loading';

interface FollowButtonProps {
  state: FollowState;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTooltip?: boolean;
}

export function FollowButton({
  state,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'md',
  className,
  showTooltip = true,
}: FollowButtonProps) {
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

  const showText = variant !== 'icon-only';

  const getButtonConfig = () => {
    switch (state) {
      case 'following':
        return {
          variant: 'secondary' as const,
          icon: UserCheck,
          text: 'Seguindo',
          tooltip: 'Deixar de seguir',
        };
      case 'requested':
        return {
          variant: 'outline' as const,
          icon: UserX,
          text: 'Solicitado',
          tooltip: 'Cancelar solicitação',
        };
      case 'loading':
        return {
          variant: 'outline' as const,
          icon: Loader2,
          text: 'Carregando...',
          tooltip: '',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: UserPlus,
          text: 'Seguir',
          tooltip: 'Seguir',
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  const buttonContent = (
    <>
      <Icon
        className={cn(
          iconSizeClasses[size],
          'transition-all duration-200',
          state === 'loading' && 'animate-spin'
        )}
        aria-hidden="true"
      />
      {showText && <span>{config.text}</span>}
    </>
  );

  if (showTooltip && state !== 'loading') {
    return (
      <Tooltip content={config.tooltip}>
        <TooltipTrigger asChild>
          <Button
            variant={config.variant}
            size={size}
            onClick={onClick}
            disabled={disabled || state === 'loading'}
            className={cn(buttonSizeClasses[size], className)}
            aria-label={config.tooltip}
            aria-pressed={state === 'following'}
          >
            {buttonContent}
          </Button>
        </TooltipTrigger>
      </Tooltip>
    );
  }

  return (
    <Button
      variant={config.variant}
      size={size}
      onClick={onClick}
      disabled={disabled || state === 'loading'}
      className={cn(buttonSizeClasses[size], className)}
      aria-label={config.tooltip}
      aria-pressed={state === 'following'}
    >
      {buttonContent}
    </Button>
  );
}