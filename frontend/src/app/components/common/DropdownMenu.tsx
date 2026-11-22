/**
 * Hub Music - DropdownMenu
 * Menu dropdown acessível com navegação por teclado
 * Accessible dropdown menu with keyboard navigation
 *
 * @languages pt-BR / en-US
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface DropdownMenuContextValue {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  toggle: () => void;
  open: () => void;
  close: () => void;
  registerItem: (id: string, element: HTMLElement) => void;
  unregisterItem: (id: string) => void;
  activeItemId: string | null;
  setActiveItemId: (id: string | null) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within DropdownMenu.Root');
  }
  return context;
}

interface DropdownMenuRootProps {
  children: ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
}

export function DropdownMenuRoot({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  modal = false,
}: DropdownMenuRootProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, HTMLElement>>(new Map());
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen(false);
    }
    onOpenChange?.(false);
    setActiveItemId(null);
    // Restore focus to trigger
    triggerRef.current?.focus();
  }, [isControlled, onOpenChange]);

  const open = useCallback(() => {
    if (!isControlled) {
      setUncontrolledOpen(true);
    }
    onOpenChange?.(true);
    previousActiveElementRef.current = document.activeElement as HTMLElement;
  }, [isControlled, onOpenChange]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, close, open]);

  const registerItem = useCallback((id: string, element: HTMLElement) => {
    itemsRef.current.set(id, element);
  }, []);

  const unregisterItem = useCallback((id: string) => {
    itemsRef.current.delete(id);
    if (activeItemId === id) {
      setActiveItemId(null);
    }
  }, [activeItemId]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current?.contains(event.target as Node) ||
        contentRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Focus management
  useEffect(() => {
    if (isOpen && contentRef.current) {
      // Focus first item
      const firstItem = contentRef.current.querySelector('[data-dropdown-item]') as HTMLElement;
      firstItem?.focus();
    }
  }, [isOpen]);

  const contextValue = {
    isOpen,
    triggerRef,
    contentRef,
    toggle,
    open,
    close,
    registerItem,
    unregisterItem,
    activeItemId,
    setActiveItemId,
  };

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  'aria-haspopup'?: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
}

export function DropdownMenuTrigger({
  children,
  className,
  'aria-haspopup': ariaHasPopup = 'menu',
  ...props
}: DropdownMenuTriggerProps) {
  const { isOpen, triggerRef, toggle } = useDropdownMenuContext();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup={ariaHasPopup}
      aria-expanded={isOpen}
      aria-controls={isOpen ? 'dropdown-menu-content' : undefined}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
        'text-text-primary hover:text-text-secondary',
        'bg-transparent border-none cursor-pointer',
        'transition-colors duration-150',
        className
      )}
      onClick={toggle}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn(
          'w-4 h-4 transition-transform duration-150',
          isOpen && 'rotate-180'
        )}
        aria-hidden="true"
      />
    </button>
  );
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  align?: 'start' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  sideOffset?: number;
  alignOffset?: number;
}

export function DropdownMenuContent({
  children,
  className,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  alignOffset = 0,
  ...props
}: DropdownMenuContentProps) {
  const { isOpen, contentRef, close, registerItem, unregisterItem, activeItemId, setActiveItemId } =
    useDropdownMenuContext();

  if (!isOpen) return null;

  const contentRefWithRegistration = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, [contentRef]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const items = Array.from(
        contentRef.current?.querySelectorAll('[data-dropdown-item]') || []
      ) as HTMLElement[];
      const currentIndex = items.findIndex((item) => item.id === activeItemId);

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % items.length;
          break;
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = (currentIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          items[currentIndex]?.click();
          break;
        case 'Tab':
          close();
          break;
        case 'Escape':
          close();
          break;
      }

      if (nextIndex !== currentIndex && items[nextIndex]) {
        items[nextIndex].focus();
        setActiveItemId(items[nextIndex].id);
      }
    },
    [activeItemId, close, setActiveItemId]
  );

  return createPortal(
    <div
      ref={contentRefWithRegistration}
      id="dropdown-menu-content"
      role="menu"
      tabIndex={-1}
      className={cn(
        'fixed z-50 min-w-[180px] max-h-[300px] overflow-y-auto',
        'rounded-lg bg-background-secondary border border-border-primary',
        'shadow-lg py-1 animate-fade-in',
        className
      )}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  disabled?: boolean;
  shortcut?: string;
  icon?: ReactNode;
  checked?: boolean;
  onSelect?: () => void;
}

export function DropdownMenuItem({
  children,
  className,
  disabled = false,
  shortcut,
  icon,
  checked = false,
  onSelect,
  onClick,
  id,
  ...props
}: DropdownMenuItemProps) {
  const { close, registerItem, unregisterItem, setActiveItemId, activeItemId } =
    useDropdownMenuContext();

  const itemRef = useRef<HTMLDivElement>(null);
  const itemId = id || `dropdown-item-${Math.random().toString(36).substring(2, 9)}`;
  const isActive = activeItemId === itemId;

  useEffect(() => {
    if (itemRef.current) {
      registerItem(itemId, itemRef.current);
    }
    return () => unregisterItem(itemId);
  }, [itemId, registerItem, unregisterItem]);

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) return;
      onClick?.(event);
      onSelect?.();
      close();
    },
    [disabled, onClick, onSelect, close]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick(event as any);
      }
    },
    [handleClick]
  );

  const handleFocus = useCallback(() => {
    setActiveItemId(itemId);
  }, [itemId, setActiveItemId]);

  const handleBlur = useCallback(() => {
    if (activeItemId === itemId) {
      setActiveItemId(null);
    }
  }, [itemId, activeItemId, setActiveItemId]);

  return (
    <div
      ref={itemRef}
      id={itemId}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-checked={checked}
      data-dropdown-item=""
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 text-sm',
        'text-text-primary hover:bg-background-tertiary',
        'transition-colors duration-100',
        'outline-none focus:bg-background-tertiary',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        isActive && 'bg-background-tertiary',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {icon && <span className="flex-shrink-0 w-4 h-4">{icon}</span>}
      {checked && (
        <Check className="flex-shrink-0 w-4 h-4 text-primary" aria-hidden="true" />
      )}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && (
        <kbd className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-background-tertiary rounded">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <hr
      role="separator"
      className={cn('my-1 h-px bg-border-primary border-none', className)}
      {...props}
    />
  );
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DropdownMenuLabel({ children, className, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      role="group"
      aria-label={typeof children === 'string' ? children : undefined}
      className={cn('px-3 py-2 text-xs font-medium text-text-muted uppercase tracking-wider', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface DropdownMenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function DropdownMenuGroup({ children, className, ...props }: DropdownMenuGroupProps) {
  return (
    <div role="group" className={cn('py-1', className)} {...props}>
      {children}
    </div>
  );
}

interface DropdownMenuShortcutProps {
  children: ReactNode;
}

export function DropdownMenuShortcut({ children }: DropdownMenuShortcutProps) {
  return (
    <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-text-muted bg-background-tertiary rounded">
      {children}
    </kbd>
  );
}

// Export as compound component
export const DropdownMenu = Object.assign(DropdownMenuRoot, {
  Trigger: DropdownMenuTrigger,
  Content: DropdownMenuContent,
  Item: DropdownMenuItem,
  Separator: DropdownMenuSeparator,
  Label: DropdownMenuLabel,
  Group: DropdownMenuGroup,
  Shortcut: DropdownMenuShortcut,
});