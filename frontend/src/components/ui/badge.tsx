/**
 * Hub Music - Badge Component
 * Componente Badge: etiqueta de status, gênero, visibilidade
 * Badge component: status, genre, visibility label
 * 
 * @languages pt-BR / en-US
 */

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-background-tertiary text-text-secondary',
      primary: 'bg-primary/20 text-primary',
      secondary: 'bg-background-tertiary text-text-secondary border border-border',
      success: 'bg-success/20 text-success',
      warning: 'bg-warning/20 text-warning',
      error: 'bg-error/20 text-error',
      outline: 'bg-transparent text-text-secondary border border-border'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-caption',
      lg: 'px-3 py-1 text-sm'
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full font-medium',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';