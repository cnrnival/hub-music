/**
 * Hub Music - AlbumSkeleton
 * Skeleton loader para cards e rows de álbum
 * Skeleton loader for album cards and rows
 *
 * @languages pt-BR / en-US
 */

import { cn } from '@/lib/utils';

interface AlbumSkeletonProps {
  variant?: 'default' | 'compact';
}

export function AlbumSkeleton({ variant = 'default' }: AlbumSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="animate-pulse flex items-center gap-3 p-2 rounded-xl bg-background-tertiary/50">
        <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-background-tertiary" />
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
      <div className="aspect-square bg-background-tertiary rounded-xl mb-3" />
      <div className="space-y-2">
        <div className="h-5 bg-background-tertiary rounded w-3/4" />
        <div className="h-4 bg-background-tertiary rounded w-1/2" />
        <div className="h-3 bg-background-tertiary rounded w-1/3" />
      </div>
    </div>
  );
}