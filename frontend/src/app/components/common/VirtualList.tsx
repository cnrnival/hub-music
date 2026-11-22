/**
 * Hub Music - VirtualList
 * Lista virtualizada para performance com muitos itens
 * Virtualized list for performance with many items
 *
 * @languages pt-BR / en-US
 */

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { cn } from '../../../lib/utils';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  width?: number | string;
  height: number | string;
  renderItem: (index: number, style: React.CSSProperties, item: T) => React.ReactNode;
  overscanCount?: number;
  className?: string;
  itemClassName?: string;
  onItemsRendered?: (startIndex: number, endIndex: number) => void;
  itemKey?: (item: T, index: number) => string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  width = '100%',
  height = '100%',
  renderItem,
  overscanCount = 5,
  className,
  itemClassName,
  onItemsRendered,
  itemKey,
}: VirtualListProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const ItemComponent = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const item = items[index];
      if (!item) return null;

      return (
        <div style={style} className={cn('w-full', itemClassName)}>
          {renderItem(index, style, item)}
        </div>
      );
    },
    [items, renderItem, itemClassName]
  );

  const getKey = useCallback(
    (index: number) => {
      const item = items[index];
      return itemKey ? itemKey(item, index) : String(index);
    },
    [items, itemKey]
  );

  if (items.length === 0) {
    return (
      <div className={cn('w-full h-full', className)} ref={containerRef} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ width, height }}
    >
      <AutoSizer disableHeight>
        {({ width: autoWidth, height: autoHeight }) => (
          <List
            height={autoHeight}
            width={autoWidth}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            itemData={items}
            onItemsRendered={onItemsRendered}
          >
            {ItemComponent}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}

// Grid version
interface VirtualGridProps<T> extends Omit<VirtualListProps<T>, 'itemHeight'> {
  itemWidth: number;
  itemHeight: number;
  columnCount?: number;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  columnCount,
  width = '100%',
  height = '100%',
  renderItem,
  overscanCount = 5,
  className,
  itemClassName,
  itemKey,
}: VirtualGridProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const columns = columnCount || Math.max(1, Math.floor(containerWidth / itemWidth));
  const rowCount = Math.ceil(items.length / columns);

  const GridItemComponent = useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const row = Math.floor(index / columns);
      const col = index % columns;

      if (row >= rowCount) return null;

      return (
        <div
          style={{
            ...style,
            width: itemWidth,
            height: itemHeight,
            left: col * itemWidth,
            top: row * itemHeight,
          }}
          className={cn('absolute', itemClassName)}
        >
          {renderItem(index, style, items[index])}
        </div>
      );
    },
    [items, columns, itemWidth, itemHeight, rowCount, renderItem, itemClassName]
  );

  if (items.length === 0) {
    return (
      <div className={cn('relative w-full h-full', className)} ref={containerRef} />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ width, height }}
    >
      <AutoSizer disableWidth>
        {({ height: autoHeight, width: autoWidth }) => (
          <List
            height={autoHeight}
            itemCount={rowCount}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            itemData={items}
            width={autoWidth}
          >
            {GridItemComponent}
          </List>
        )}
      </AutoSizer>
    </div>
  );
}