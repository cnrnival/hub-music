/**
 * Hub Music - EmptyState
 * Estado vazio com ilustração, mensagem e ação
 * Empty state with illustration, message, and action
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  illustrationClassName?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  illustrationClassName,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-4', className)}>
      <div className={cn(
        'w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-background-tertiary',
        illustrationClassName
      )}>
        {icon || (
          <Music className="w-12 h-12 text-text-muted" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>

      {description && (
        <p className="text-text-secondary max-w-sm mb-6">{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              className="w-full sm:w-auto gap-2"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

import { Music } from 'lucide-react';