/**
 * Hub Music - Avatar
 * Componente de avatar com fallback para iniciais
 * Avatar component with initials fallback
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  xxl: 'w-24 h-24 text-xl',
};

const ringSizeClasses: Record<AvatarSize, string> = {
  xs: 'ring-1',
  sm: 'ring-2',
  md: 'ring-2',
  lg: 'ring-2',
  xl: 'ring-3',
  xxl: 'ring-3',
};

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
  className?: string;
  alt?: string;
  onClick?: () => void;
  fallbackColor?: string;
}

export function Avatar({
  src,
  name,
  size = 'md',
  className,
  alt,
  onClick,
  fallbackColor,
}: AvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getColorFromName = (name: string) => {
    const colors = [
      'bg-primary',
      'bg-primary-dark',
      'bg-pink-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-orange-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = fallbackColor || (name ? getColorFromName(name) : 'bg-primary');
  const initials = name ? getInitials(name) : '?';

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-background-tertiary',
        sizeClasses[size],
        ringSizeClasses[size],
        'ring-background',
        'transition-transform duration-200',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
          loading="lazy"
        />
      ) : (
        <div className={cn('w-full h-full flex items-center justify-center font-medium text-white', bgColor)}>
          {initials}
        </div>
      )}
    </div>
  );
}