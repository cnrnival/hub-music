/**
 * Hub Music - SectionHeader
 * Cabeçalho de seção com título e link "Ver tudo"
 * Section header with title and "See all" link
 *
 * @languages pt-BR / en-US
 */

import { ChevronRight } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button } from '../../components/ui/button';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    href?: string;
  };
  className?: string;
  titleClassName?: string;
}

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h2 className={cn('text-xl font-bold text-text-primary', titleClassName)}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>

      {action && (
        <Button
          variant="ghost"
          size="sm"
          onClick={action.onClick}
          className="gap-1 h-auto px-2"
        >
          {action.label}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

// Variant for home page sections
export function HomeSectionHeader({
  title,
  subtitle,
  onSeeAll,
  seeAllLabel = 'Ver tudo',
  className,
}: {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllLabel?: string;
  className?: string;
}) {
  return (
    <SectionHeader
      title={title}
      subtitle={subtitle}
      action={onSeeAll ? { label: seeAllLabel, onClick: onSeeAll } : undefined}
      className={cn('px-4', className)}
    />
  );
}

// Variant for library tabs
export function LibrarySectionHeader({
  title,
  count,
  action,
  className,
}: {
  title: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        {count !== undefined && (
          <p className="text-sm text-text-secondary mt-0.5">{count} itens</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}