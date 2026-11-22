/**
 * Hub Music - useIntersectionObserver Hook
 * Observer para lazy loading, infinite scroll, animações
 * Observer for lazy loading, infinite scroll, animations
 *
 * @languages pt-BR / en-US
 */

import { useEffect, useRef, useState, useCallback } from 'react';

interface IntersectionObserverOptions extends IntersectionObserverInit {
  /** Trigger once and disconnect */
  once?: boolean;
  /** Callback on intersect */
  onIntersect?: (entry: IntersectionObserverEntry) => void;
  /** Callback on disconnect */
  onDisconnect?: () => void;
}

interface UseIntersectionObserverReturn {
  ref: React.RefObject<HTMLElement>;
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | null;
  observe: (element: HTMLElement) => void;
  unobserve: (element: HTMLElement) => void;
  disconnect: () => void;
}

/**
 * Hook para observar interseção de um elemento
 */
export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    once = false,
    onIntersect,
    onDisconnect,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
      onDisconnect?.();
    }
  }, [onDisconnect]);

  const observe = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserve = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);

        if (entry.isIntersecting) {
          onIntersect?.(entry);
          if (once) {
            disconnect();
          }
        }
      },
      { root, rootMargin, threshold }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => disconnect();
  }, [root, rootMargin, threshold, once, onIntersect, disconnect]);

  const ref = useCallback((node: HTMLElement | null) => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
    elementRef.current = node;
    if (observerRef.current && node) {
      observerRef.current.observe(node);
    }
  }, []);

  return { ref, isIntersecting, entry, observe, unobserve, disconnect };
}

/**
 * Hook para lazy loading de imagens
 */
export function useLazyImage(
  src: string,
  options: IntersectionObserverOptions = {}
) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    once: true,
    onIntersect: () => {
      setImageSrc(src);
    },
  });

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      setError(true);
      setIsLoaded(false);
    };
  }, [imageSrc]);

  return { ref, isLoaded, error, imageSrc };
}

/**
 * Hook para animações baseadas em scroll (scroll-triggered animations)
 */
export function useScrollAnimation(
  options: IntersectionObserverOptions = {}
) {
  const [hasAnimated, setHasAnimated] = useState(false);

  const { ref, isIntersecting } = useIntersectionObserver({
    ...options,
    once: true,
    threshold: options.threshold || 0.1,
    onIntersect: () => {
      setHasAnimated(true);
      options.onIntersect?.(options.onIntersect as any);
    },
  });

  return { ref, hasAnimated, isIntersecting };
}

/**
 * Hook para infinite scroll com sentinel
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  options: {
    hasMore: boolean;
    isLoading: boolean;
    threshold?: number;
    rootMargin?: string;
  }
) {
  const { hasMore, isLoading, threshold = 0.1, rootMargin = '200px' } = options;

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold,
    rootMargin,
    onIntersect: () => {
      if (hasMore && !isLoading) {
        onLoadMore();
      }
    },
  });

  return { ref, isIntersecting };
}

/**
 * Hook para detectar quando elemento sai da viewport (para pausar vídeos, etc)
 */
export function useViewportVisibility(
  options: IntersectionObserverOptions = {}
) {
  const [isVisible, setIsVisible] = useState(true);
  const [visibilityRatio, setVisibilityRatio] = useState(1);

  const { ref, entry } = useIntersectionObserver({
    ...options,
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    onIntersect: (entry) => {
      setIsVisible(entry.isIntersecting);
      setVisibilityRatio(entry.intersectionRatio);
    },
  });

  return { ref, isVisible, visibilityRatio, entry };
}