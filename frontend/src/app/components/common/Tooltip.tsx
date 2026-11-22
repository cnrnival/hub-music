/**
 * Hub Music - Tooltip
 * Tooltip acessível com posicionamento automático
 * Accessible tooltip with auto-positioning
 *
 * @languages pt-BR / en-US
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  delay?: number;
  hideDelay?: number;
  className?: string;
  contentClassName?: string;
  arrow?: boolean;
  interactive?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  offset = 8,
  delay = 200,
  hideDelay = 100,
  className,
  contentClassName,
  arrow = true,
  interactive = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const showTimeoutRef = useRef<number>();
  const hideTimeoutRef = useRef<number>();

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top + scrollY - tooltipRect.height - offset;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollY + offset;
        left = triggerRect.left + scrollX + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + scrollX - tooltipRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + scrollX + offset;
        break;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    if (left < padding) left = padding;
    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > viewportHeight - padding) {
      top = viewportHeight - tooltipRect.height - padding;
    }

    setTooltipPosition({ top, left });
  }, [position, offset]);

  const show = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      // Position after render
      requestAnimationFrame(updatePosition);
    }, delay);
  }, [delay, updatePosition]);

  const hide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  }, [hideDelay]);

  const handleMouseEnter = useCallback(() => {
    show();
  }, [show]);

  const handleMouseLeave = useCallback(() => {
    if (!interactive) {
      hide();
    }
  }, [hide, interactive]);

  const handleFocus = useCallback(() => {
    show();
  }, [show]);

  const handleBlur = useCallback(() => {
    hide();
  }, [hide]);

  // Handle tooltip hover for interactive tooltips
  const handleTooltipMouseEnter = useCallback(() => {
    if (interactive && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, [interactive]);

  const handleTooltipMouseLeave = useCallback(() => {
    if (interactive) {
      hide();
    }
  }, [hide, interactive]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, updatePosition]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Clone child and add event handlers
  const childWithProps = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
    'aria-describedby': isVisible ? 'tooltip-content' : undefined,
  });

  if (!isVisible) {
    return childWithProps;
  }

  const tooltipContent = (
    <div
      ref={tooltipRef}
      id="tooltip-content"
      role="tooltip"
      className={cn(
        'fixed z-50 px-2 py-1.5 text-xs font-medium text-white',
        'bg-gray-900 rounded shadow-lg',
        'animate-fade-in pointer-events-none',
        'whitespace-nowrap',
        contentClassName
      )}
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
    >
      {content}
      {arrow && (
        <div
          className={cn(
            'absolute w-2 h-2 bg-gray-900 rotate-45',
            position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
            position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
            position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
            position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
          )}
        />
      )}
    </div>
  );

  return (
    <>
      {childWithProps}
      {createPortal(tooltipContent, document.body)}
    </>
  );
}

import React from 'react';