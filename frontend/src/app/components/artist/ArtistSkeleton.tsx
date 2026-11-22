/**
 * Hub Music - ArtistSkeleton
 * Skeleton loader para cards e rows de artista
 * Skeleton loader for artist cards and rows
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';

interface ArtistSkeletonProps {
  variant?: 'default' | 'compact';
}

export function ArtistSkeleton({ variant = 'default' }: ArtistSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="animate-pulse flex items-center gap-3 p-2 rounded-xl bg-background-tertiary/50">
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-background-tertiary" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-background-tertiary rounded w-3/4" />
          <div className="h-3 bg-background-tertiary rounded w-1/2" />
        </div>
        <div className="w-20 h-4 bg-background-tertiary rounded" />
      </div>
    );
  }

  return (
    <div className="card-interactive animate-pulse p-4">
      <div className="aspect-square bg-background-tertiary rounded-full mb-3" />
      <div className="space-y-2 text-center">
        <div className="h-5 bg-background-tertiary rounded w-3/4 mx-auto" />
        <div className="h-4 bg-background-tertiary rounded w-1/2 mx-auto" />
      </div>
    </div>
  );
}