/**
 * Hub Music - TrackSkeleton
 * Skeleton loader para cards e rows de faixa
 * Skeleton loader for track cards and rows
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';

interface TrackSkeletonProps {
  variant?: 'default' | 'compact' | 'list';
}

export function TrackSkeleton({ variant = 'default' }: TrackSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="animate-pulse flex items-center gap-4 p-2 rounded-xl bg-background-tertiary/50">
        <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-background-tertiary" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-background-tertiary rounded w-3/4" />
          <div className="h-3 bg-background-tertiary rounded w-1/2" />
        </div>
        <div className="w-24 h-4 bg-background-tertiary rounded" />
      </div>
    );
  }

  return (
    <div className={cn('card-interactive animate-pulse', variant === 'compact' ? 'p-2' : 'p-4')}>
      <div className="aspect-square bg-background-tertiary rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-background-tertiary rounded w-3/4" />
        <div className="h-3 bg-background-tertiary rounded w-1/2" />
        <div className="h-3 bg-background-tertiary rounded w-1/3" />
      </div>
    </div>
  );
}