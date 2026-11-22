import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const baseStyles = 'bg-background-tertiary animate-pulse rounded';

  const variantStyles = {
    text: 'h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className, ...props }: { lines?: number; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%' } />
      ))}
    </div>
  );
}

export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4 p-4', className)} {...props}>
      <Skeleton variant="circular" className="w-16 h-16 mx-auto" />
      <SkeletonText lines={3} className="max-w-xs mx-auto" />
      <Skeleton variant="rectangular" className="h-32 w-full" />
    </div>
  );
}