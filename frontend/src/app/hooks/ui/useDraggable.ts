/**
 * Hub Music - useDraggable Hook
 * Arrastar elementos (PIP, QueuePanel, Sidebar resize)
 * Drag elements (PIP, QueuePanel, Sidebar resize)
 *
 * @languages pt-BR / en-US
 */

import { useRef, useCallback, useEffect, useState } from 'react';

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
}

interface UseDraggableOptions {
  onDragStart?: (state: DragState) => void;
  onDrag?: (state: DragState) => void;
  onDragEnd?: (state: DragState) => void;
  bounds?: {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
  };
  handle?: string; // CSS selector for drag handle
  disabled?: boolean;
}

interface UseDraggableReturn {
  ref: React.RefObject<HTMLElement>;
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
  };
  state: DragState;
  setPosition: (x: number, y: number) => void;
  resetPosition: () => void;
}

export function useDraggable(options: UseDraggableOptions = {}): UseDraggableReturn {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    bounds,
    handle,
    disabled = false,
  } = options;

  const elementRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const dragStateRef = useRef(state);
  dragStateRef.current = state;

  // Update position with bounds checking
  const updatePosition = useCallback((clientX: number, clientY: number) => {
    const { startX, startY, offsetX, offsetY } = dragStateRef.current;

    let newX = clientX - startX + offsetX;
    let newY = clientY - startY + offsetY;

    // Apply bounds
    if (bounds) {
      if (bounds.minX !== undefined) newX = Math.max(bounds.minX, newX);
      if (bounds.maxX !== undefined) newX = Math.min(bounds.maxX, newX);
      if (bounds.minY !== undefined) newY = Math.max(bounds.minY, newY);
      if (bounds.maxY !== undefined) newY = Math.min(bounds.maxY, newY);
    }

    setState(prev => ({
      ...prev,
      currentX: newX,
      currentY: newY,
    }));

    onDrag?.({
      ...dragStateRef.current,
      currentX: newX,
      currentY: newY,
    });
  }, [bounds, onDrag]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStateRef.current.isDragging) return;
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleMouseUp = useCallback(() => {
    if (!dragStateRef.current.isDragging) return;

    const finalState = dragStateRef.current;
    setState(prev => ({ ...prev, isDragging: false }));
    onDragEnd?.(finalState);

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleMouseMove, onDragEnd]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!dragStateRef.current.isDragging) return;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  const handleTouchEnd = useCallback(() => {
    if (!dragStateRef.current.isDragging) return;

    const finalState = dragStateRef.current;
    setState(prev => ({ ...prev, isDragging: false }));
    onDragEnd?.(finalState);

    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  }, [handleTouchMove, onDragEnd]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    // Check if clicking on handle
    if (handle) {
      const target = e.target as HTMLElement;
      if (!target.closest(handle)) return;
    }

    // Prevent text selection during drag
    e.preventDefault();
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';

    const startX = e.clientX;
    const startY = e.clientY;
    const { offsetX, offsetY } = dragStateRef.current;

    setState(prev => ({
      ...prev,
      isDragging: true,
      startX,
      startY,
    }));

    onDragStart?.({
      isDragging: true,
      startX,
      startY,
      currentX: offsetX,
      currentY: offsetY,
      offsetX,
      offsetY,
    });

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, handle, handleMouseMove, handleMouseUp, onDragStart]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    if (handle) {
      const target = e.target as HTMLElement;
      if (!target.closest(handle)) return;
    }

    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    const { offsetX, offsetY } = dragStateRef.current;

    setState(prev => ({
      ...prev,
      isDragging: true,
      startX,
      startY,
    }));

    onDragStart?.({
      isDragging: true,
      startX,
      startY,
      currentX: offsetX,
      currentY: offsetY,
      offsetX,
      offsetY,
    });

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [disabled, handle, handleTouchMove, handleTouchEnd, onDragStart]);

  const setPosition = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      currentX: x,
      currentY: y,
      offsetX: x,
      offsetY: y,
    }));
  }, []);

  const resetPosition = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentX: 0,
      currentY: 0,
      offsetX: 0,
      offsetY: 0,
    }));
  }, []);

  return {
    ref: elementRef,
    handlers: { onMouseDown, onTouchStart },
    state,
    setPosition,
    resetPosition,
  };
}

// Hook for resizable elements (like sidebar)
interface UseResizableOptions {
  direction: 'horizontal' | 'vertical' | 'both';
  minSize?: number;
  maxSize?: number;
  onResize?: (size: number) => void;
  disabled?: boolean;
}

export function useResizable(options: UseResizableOptions) {
  const { direction, minSize = 0, maxSize = Infinity, onResize, disabled = false } = options;
  const elementRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState(0);
  const isResizingRef = useRef(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current) return;

    const delta = direction === 'horizontal' || direction === 'both'
      ? e.clientX - startPosRef.current
      : e.clientY - startPosRef.current;

    let newSize = startSizeRef.current + delta;
    newSize = Math.max(minSize, Math.min(maxSize, newSize));

    setSize(newSize);
    onResize?.(newSize);
  }, [direction, minSize, maxSize, onResize]);

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, [handleMouseMove]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;

    e.preventDefault();
    e.stopPropagation();

    isResizingRef.current = true;
    startPosRef.current = direction === 'horizontal' || direction === 'both'
      ? e.clientX
      : e.clientY;
    startSizeRef.current = size;

    document.body.style.userSelect = 'none';
    document.body.style.cursor = direction === 'horizontal' ? 'ew-resize' : 'ns-resize';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, direction, size, handleMouseMove, handleMouseUp]);

  return {
    ref: elementRef,
    size,
    setSize,
    handlers: { onMouseDown },
    isResizing: isResizingRef.current,
  };
}