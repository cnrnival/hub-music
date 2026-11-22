/**
 * Hub Music - Dropdown Menu
 * Menu dropdown acessível (shadcn/ui pattern)
 * Accessible dropdown menu (shadcn/ui pattern)
 *
 * @languages pt-BR / en-US
 */

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '../../../lib/utils';
import { X } from 'lucide-react';
import { Button } from './button';

interface DropdownMenuProps {
  children: ReactNode;
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'end' | 'center';
  className?: string;
  children: ReactNode;
  onClose?: () => void;
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  onSelect?: () => void;
}

interface DropdownMenuSeparatorProps {
  className?: string;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  return <>{children}</>;
}

export function DropdownMenuTrigger({ asChild = false, children }: DropdownMenuTriggerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
          contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  const Child = asChild ? children : Button;
  const childProps = asChild ? { ref: triggerRef, onClick: () => setOpen(!open) } : { ref: triggerRef, onClick: () => setOpen(!open) };

  return (
    <div className="relative inline-block" ref={triggerRef}>
      {typeof Child === 'function' ? (
        <Child {...childProps}>{children}</Child>
      ) : (
        <Child {...childProps}>{children}</Child>
      )}
      {open && (
        <DropdownMenuPortal>
          <DropdownMenuContent ref={contentRef} onClose={() => setOpen(false)}>
            {children}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      )}
    </div>
  );
}

function DropdownMenuPortal({ children }: { children: ReactNode }) {
  // Simple portal to body
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return <div className="fixed inset-0 z-50 pointer-events-none">{children}</div>;
}

export function DropdownMenuContent({ align = 'end', className, children, onClose }: DropdownMenuContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const triggerRectRef = useRef<DOMRect>();

  useEffect(() => {
    // Position near trigger
    const trigger = document.querySelector('[data-dropdown-trigger]');
    if (trigger) {
      triggerRectRef.current = trigger.getBoundingClientRect();
    }
  }, []);

  const alignStyles = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'fixed z-50 mt-2 w-56 origin-top-right rounded-xl bg-background-secondary border border-border shadow-xl',
        'animate-fade-in-scale',
        alignStyles[align],
        'pointer-events-auto',
        className
      )}
      role="menu"
      style={{
        top: triggerRectRef.current?.bottom,
        left: align === 'start' ? triggerRectRef.current?.left :
            align === 'center' ? triggerRectRef.current?.left + triggerRectRef.current.width / 2 :
            triggerRectRef.current?.right,
      }}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({ children, onSelect, className, onClick, ...props }: DropdownMenuItemProps) {
  const handleClick = () => {
    onSelect?.();
    onClick?.();
  };

  return (
    <button
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary',
        'hover:bg-background-tertiary transition-colors',
        'focus:outline-none focus:bg-background-tertiary',
        className
      )}
      onClick={handleClick}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: DropdownMenuSeparatorProps) {
  return <div className={cn('h-px bg-border my-1', className)} role="separator" />;
}