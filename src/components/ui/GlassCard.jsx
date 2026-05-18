import { cn } from '../../lib/utils';

export default function GlassCard({
  children,
  className = '',
  shimmer = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'glass-card-hover relative',
        shimmer && 'shimmer-border overflow-hidden',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
