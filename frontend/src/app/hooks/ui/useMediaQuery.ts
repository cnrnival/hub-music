/**
 * Hub Music - useMediaQuery Hook
 * Media queries reativas para design responsivo
 * Reactive media queries for responsive design
 *
 * @languages pt-BR / en-US
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook para uma única media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * Hook para múltiplas media queries (breakpoints)
 */
export function useBreakpoints() {
  const breakpoints = useMemo(() => ({
    xs: '(max-width: 639px)',
    sm: '(min-width: 640px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1023px)',
    lg: '(min-width: 1024px) and (max-width: 1279px)',
    xl: '(min-width: 1280px) and (max-width: 1535px)',
    '2xl': '(min-width: 1536px)',
  }), []);

  const matches = useMemo(() => {
    const result: Record<string, boolean> = {};
    Object.entries(breakpoints).forEach(([key, query]) => {
      result[key] = useMediaQuery(query);
    });
    return result;
  }, [breakpoints]);

  // Current breakpoint
  const current = useMemo(() => {
    const entries = Object.entries(matches).filter(([, value]) => value);
    return entries.length > 0 ? entries[entries.length - 1][0] : 'xs';
  }, [matches]);

  // Helpers
  const isMobile = matches.xs || matches.sm;
  const isTablet = matches.md;
  const isDesktop = matches.lg || matches.xl || matches['2xl'];
  const isLarge = matches.xl || matches['2xl'];

  return {
    ...matches,
    current,
    isMobile,
    isTablet,
    isDesktop,
    isLarge,
    breakpoints,
  };
}

/**
 * Hook para orientação
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    return () => window.removeEventListener('resize', updateOrientation);
  }, []);

  return orientation;
}

/**
 * Hook para prefers-reduced-motion
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook para prefers-color-scheme
 */
export function useColorScheme(): 'light' | 'dark' {
  const isDark = useMediaQuery('(prefers-color-scheme: dark)');
  return isDark ? 'dark' : 'light';
}

/**
 * Hook para prefers-contrast
 */
export function useHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: more)');
}

/**
 * Hook para hover capability
 */
export function useHoverCapability(): 'hover' | 'none' {
  const canHover = useMediaQuery('(hover: hover)');
  return canHover ? 'hover' : 'none';
}

/**
 * Hook para pointer precision
 */
export function usePointerPrecision(): 'fine' | 'coarse' {
  const isFine = useMediaQuery('(pointer: fine)');
  return isFine ? 'fine' : 'coarse';
}

/**
 * Hook para device pixel ratio
 */
export function usePixelRatio(): number {
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateRatio = () => {
      setRatio(window.devicePixelRatio || 1);
    };

    updateRatio();
    const mediaQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const handler = () => updateRatio();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return ratio;
}

/**
 * Hook combinado para todas as capacidades do dispositivo
 */
export function useDeviceCapabilities() {
  const breakpoints = useBreakpoints();
  const orientation = useOrientation();
  const reducedMotion = useReducedMotion();
  const colorScheme = useColorScheme();
  const highContrast = useHighContrast();
  const hover = useHoverCapability();
  const pointer = usePointerPrecision();
  const pixelRatio = usePixelRatio();

  return {
    ...breakpoints,
    orientation,
    reducedMotion,
    colorScheme,
    highContrast,
    hover,
    pointer,
    pixelRatio,
    // Helpers
    isTouch: pointer === 'coarse',
    isMobile: breakpoints.isMobile,
    isTablet: breakpoints.isTablet,
    isDesktop: breakpoints.isDesktop,
    shouldReduceMotion: reducedMotion,
    shouldUseHighContrast: highContrast,
  };
}

/**
 * Hook para container queries (requer suporte do navegador)
 */
export function useContainerQuery(
  containerRef: React.RefObject<HTMLElement>,
  queries: Record<string, string>
): Record<string, boolean> {
  const [matches, setMatches] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const container = containerRef.current;
    const observers: Map<string, ResizeObserver> = new Map();

    Object.entries(queries).forEach(([key, query]) => {
      // Parse query like "(min-width: 400px)"
      const match = query.match(/\((min|max)-(width|height):\s*(\d+)px\)/);
      if (!match) return;

      const [, type, dimension, value] = match;
      const threshold = parseInt(value, 10);

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const size = dimension === 'width' ? entry.contentRect.width : entry.contentRect.height;
          let result = false;

          if (type === 'min') {
            result = size >= threshold;
          } else {
            result = size <= threshold;
          }

          setMatches((prev) => ({ ...prev, [key]: result }));
        }
      });

      observer.observe(container);
      observers.set(key, observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [containerRef, queries]);

  return matches;
}