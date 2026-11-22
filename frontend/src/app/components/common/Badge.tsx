/**
 * Hub Music - Badge
 * Componente de badge/tag com variantes
 * Badge/tag component with variants
 *
 * @languages pt-BR / en-US
 */

import { cn } from '../../../lib/utils';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline' | 'ghost';

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-primary/20',
  primary: 'bg-primary text-white',
  secondary: 'bg-secondary text-white',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  outline: 'bg-transparent text-text-secondary border-border-primary',
  ghost: 'bg-background-tertiary text-text-secondary',
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  dotColor?: string;
}

export function Badge({
  variant = 'default',
  size = 'md',
  dot,
  dotColor,
  className,
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    md: 'px-2 py-1 text-xs gap-1',
    lg: 'px-3 py-1.5 text-sm gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-full',
        'border transition-colors duration-200',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            dotColor || (variant === 'primary' || variant === 'secondary' ? 'bg-white' : 'bg-current')
          )}
        />
      )}
      {children}
    </span>
  );
}