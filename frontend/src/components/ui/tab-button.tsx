/**
 * Hub Music - Tab Button Component
 * Componente Botão de Aba: botão para abas de navegação
 * Tab Button component: tab navigation button
 * 
 * @languages pt-BR / en-US
 */

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

export const TabButton = forwardRef<HTMLButtonElement, TabButtonProps>(
  ({ className, active, icon: Icon, count, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
          className
        )}
        {...props}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
        {count !== undefined && count > 0 && (
          <span className={cn(
            'px-2 py-0.5 text-xs rounded-full',
            active ? 'bg-primary/30 text-primary' : 'bg-background-tertiary text-text-muted'
          )}>
            {count}
          </span>
        )}
      </button>
    );
  }
);

TabButton.displayName = 'TabButton';