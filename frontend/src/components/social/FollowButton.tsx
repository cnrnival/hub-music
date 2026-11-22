/**
 * Hub Cloud - Follow Button Component
 * Componente Seguir: botão para seguir ou deixar de seguir usuário
 * Follow Button component: follow/unfollow user button
 * 
 * @languages pt-BR / en-US
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  userId: string;
  following: boolean;
  followersCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  onToggle?: () => void;
}

export function FollowButton({
  userId,
  following,
  followersCount,
  size = 'md',
  showCount = false,
  variant = 'default',
  onToggle
}: FollowButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.toggleFollow(userId),
    onMutate: async () => {
      // Optimistic update for profile page
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      queryClient.setQueriesData({ queryKey: ['profile'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !following,
          _count: {
            ...old._count,
            followers: following ? (old._count?.followers || 1) - 1 : (old._count?.followers || 0) + 1
          }
        };
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    }
  });

  const handleClick = () => {
    mutation.mutate();
    onToggle?.();
  };

  const sizes = {
    sm: { px: 'px-3', py: 'py-1.5', text: 'text-sm', icon: 'w-4 h-4', gap: 'gap-1.5' },
    md: { px: 'px-4', py: 'py-2', text: 'text-button', icon: 'w-5 h-5', gap: 'gap-2' },
    lg: { px: 'px-5', py: 'py-2.5', text: 'text-base', icon: 'w-5 h-5', gap: 'gap-2' }
  };

  const variants = {
    default: following
      ? 'bg-background-tertiary text-text-secondary hover:bg-background-hover border border-border'
      : 'bg-primary text-white hover:bg-primary-dark',
    outline: following
      ? 'bg-transparent text-text-secondary border border-border hover:border-error hover:text-error'
      : 'bg-transparent text-primary border border-primary hover:bg-primary/10',
    ghost: following
      ? 'bg-transparent text-text-secondary hover:bg-background-tertiary'
      : 'bg-transparent text-primary hover:bg-primary/10'
  };

  const currentSize = sizes[size];
  const currentVariant = variants[variant];

  if (following) {
    return (
      <Button
        variant="ghost"
        className={cn(currentSize.px, currentSize.py, currentSize.text, currentSize.gap, currentVariant)}
        onClick={handleClick}
        disabled={mutation.isPending}
        aria-label="Deixar de seguir"
        aria-pressed={true}
      >
        <UserCheck className={currentSize.icon} />
        <span>Seguindo</span>
        {showCount && followersCount !== undefined && (
          <span className="text-xs bg-background-tertiary px-2 py-0.5 rounded-full">
            {formatNumber(followersCount)}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Button
      className={cn(currentSize.px, currentSize.py, currentSize.text, currentSize.gap, currentVariant)}
      onClick={handleClick}
      disabled={mutation.isPending}
      aria-label="Seguir"
      aria-pressed={false}
    >
      <UserPlus className={currentSize.icon} />
      <span>Seguir</span>
      {showCount && followersCount !== undefined && (
        <span className="text-xs bg-background-tertiary px-2 py-0.5 rounded-full">
          {formatNumber(followersCount)}
        </span>
      )}
    </Button>
  );
}

// Compact version for user cards/lists
export function FollowButtonCompact({ userId, following, onToggle }: { userId: string; following: boolean; onToggle?: () => void }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.toggleFollow(userId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      queryClient.setQueriesData({ queryKey: ['profile'] }, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: !following,
          _count: {
            ...old._count,
            followers: following ? (old._count?.followers || 1) - 1 : (old._count?.followers || 0) + 1
          }
        };
      });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });

  const handleClick = () => {
    mutation.mutate();
    onToggle?.();
  };

  return (
    <Button
      variant={following ? 'secondary' : 'primary'}
      size="sm"
      onClick={handleClick}
      disabled={mutation.isPending}
      className="whitespace-nowrap"
    >
      {following ? (
        <>
          <UserCheck className="w-4 h-4 mr-2" />
          Seguindo
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4 mr-2" />
          Seguir
        </>
      )}
    </Button>
  );
}