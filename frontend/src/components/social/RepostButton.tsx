/**
 * Hub Music - Repost Button Component
 * Componente Repost: botão para repostar ou desfazer repost de faixa
 * Repost Button component: repost/unrepost track button
 * 
 * @languages pt-BR / en-US
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Repeat } from 'lucide-react';

interface RepostButtonProps {
  trackId: string;
  reposted: boolean;
  count: number;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function RepostButton({ trackId, reposted, count, onToggle, size = 'md', showCount = true }: RepostButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.toggleRepost(trackId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['track', trackId] });
      const previous = queryClient.getQueryData(['track', trackId]);
      queryClient.setQueryData(['track', trackId], (old: any) => ({
        ...old,
        userReposted: !reposted,
        _count: { ...old._count, reposts: reposted ? old._count.reposts - 1 : old._count.reposts + 1 }
      }));
      return { previous };
    },
    onError: (err, _, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['track', trackId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
    }
  });

  const handleClick = () => {
    mutation.mutate();
    onToggle?.();
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        sizes[size],
        reposted ? 'text-primary' : 'text-text-secondary hover:text-primary'
      )}
      onClick={handleClick}
      disabled={mutation.isPending}
      aria-label={reposted ? 'Remover repost' : 'Repostar'}
      aria-pressed={reposted}
    >
      <Repeat
        className={cn(
          iconSizes[size],
          'transition-transform duration-200',
          reposted ? 'scale-100' : 'scale-100 hover:scale-110'
        )}
      />
      {showCount && count > 0 && (
        <span className={cn(
          'ml-1 font-medium',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}>
          {formatNumber(count)}
        </span>
      )}
    </Button>
  );
}