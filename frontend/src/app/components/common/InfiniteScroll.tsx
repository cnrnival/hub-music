/**
 * Hub Music - InfiniteScroll
 * Componente de scroll infinito usando IntersectionObserver
 * Infinite scroll component using IntersectionObserver
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface InfiniteScrollProps {
  children: React.ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
  loader?: React.ReactNode;
  className?: string;
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '200px',
  loader,
  className,
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [showLoader, setShowLoader] = useState(false);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        setShowLoader(true);
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold, rootMargin]);

  // Hide loader after a delay to prevent flickering
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <div className={cn('relative', className)}>
      {children}
      {hasMore && (
        <div ref={sentinelRef} className="h-12 flex items-center justify-center">
          {(isLoading || showLoader) && (
            <div className="flex items-center justify-center gap-2 text-text-muted">
              {loader || (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm">Carregando mais...</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}