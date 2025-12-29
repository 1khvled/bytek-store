import { cn } from '@/lib/utils';

interface ProductSkeletonProps {
  className?: string;
}

export function ProductSkeleton({ className }: ProductSkeletonProps) {
  return (
    <div className={cn("bg-card rounded-xl overflow-hidden border border-border", className)}>
      {/* Image skeleton */}
      <div className="aspect-square bg-secondary animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <div className="h-3 w-16 bg-secondary rounded animate-pulse" />
        
        {/* Name */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-secondary rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-secondary rounded animate-pulse" />
        </div>
        
        {/* Rating */}
        <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
        
        {/* Price */}
        <div className="h-5 w-24 bg-secondary rounded animate-pulse" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
