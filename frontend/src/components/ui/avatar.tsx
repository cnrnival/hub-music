/**
 * Hub Music - Avatar Component
 * Componente Avatar: foto de perfil circular do usuário
 * Avatar component: circular user profile picture
 * 
 * @languages pt-BR / en-US
 */

import { forwardRef, ImgHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, src, alt, name, size = 'md', shape = 'circle', ...props }, ref) => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-24 h-24 text-2xl'
    };

    const shapes = {
      circle: 'rounded-full',
      square: 'rounded-xl'
    };

    const bgColors = [
      'bg-red-500/20',
      'bg-orange-500/20',
      'bg-amber-500/20',
      'bg-green-500/20',
      'bg-emerald-500/20',
      'bg-teal-500/20',
      'bg-cyan-500/20',
      'bg-sky-500/20',
      'bg-blue-500/20',
      'bg-indigo-500/20',
      'bg-violet-500/20',
      'bg-purple-500/20',
      'bg-fuchsia-500/20',
      'bg-pink-500/20',
      'bg-rose-500/20'
    ];

    const textColors = [
      'text-red-400',
      'text-orange-400',
      'text-amber-400',
      'text-green-400',
      'text-emerald-400',
      'text-teal-400',
      'text-cyan-400',
      'text-sky-400',
      'text-blue-400',
      'text-indigo-400',
      'text-violet-400',
      'text-purple-400',
      'text-fuchsia-400',
      'text-pink-400',
      'text-rose-400'
    ];

    const getColorIndex = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash) % bgColors.length;
    };

    const initials = name
      ? name
          .split(' ')
          .map(part => part[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)
      : '?';

    const colorIndex = name ? getColorIndex(name) : 0;

    if (src) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt || name || 'Avatar'}
          className={cn(sizes[size], shapes[shape], 'object-cover', className)}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          sizes[size],
          shapes[shape],
          'flex items-center justify-center font-medium select-none',
          bgColors[colorIndex],
          textColors[colorIndex],
          className
        )}
        aria-label={name || 'Avatar'}
        {...props}
      >
        {initials}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  className?: string;
}

export function AvatarGroup({ children, max = 5, size = 'md', className }: AvatarGroupProps) {
  const kids = Array.isArray(children) ? children : [children];
  const visible = kids.slice(0, max);
  const remaining = kids.length - max;

  return (
    <div className={cn('flex -space-x-2', className)} aria-label={`${kids.length} avatars`}>
      {visible.map((child, index) =>
        React.cloneElement(child as React.ReactElement, {
          key: index,
          size,
          className: cn('ring-2 ring-background', (child as React.ReactElement).props.className)
        })
      )}
      {remaining > 0 && (
        <div
          className={cn(
            sizes[size],
            'rounded-full flex items-center justify-center font-medium text-text-muted bg-background-tertiary ring-2 ring-background'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

// Re-export sizes for AvatarGroup
const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl'
};