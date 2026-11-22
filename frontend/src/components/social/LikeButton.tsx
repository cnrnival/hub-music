/**
 * Hub Music - Like Button Component
 * Componente Curtir: botão para curtir ou descurtir faixa
 * Like Button component: like/unlike track button
 * 
 * @languages pt-BR / en-US
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { formatNumber } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  trackId: string;
  liked: boolean;
  count: number;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function LikeButton({ trackId, liked, count, onToggle, size = 'md', showCount = true }: LikeButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.toggleLike(trackId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['track', trackId] });
      const previous = queryClient.getQueryData(['track', trackId]);
      queryClient.setQueryData(['track', trackId], (old: any) => ({
        ...old,
        userLiked: !liked,
        _count: { ...old._count, likes: liked ? old._count.likes - 1 : old._count.likes + 1 }
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
        liked ? 'text-error' : 'text-text-secondary hover:text-error'
      )}
      onClick={handleClick}
      disabled={mutation.isPending}
      aria-label={liked ? 'Descurtir' : 'Curtir'}
      aria-pressed={liked}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-transform duration-200',
          liked ? 'fill-current scale-100' : 'scale-100 hover:scale-110'
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