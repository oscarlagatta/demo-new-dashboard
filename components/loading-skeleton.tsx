import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  className?: string
}

export function ButtonLoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <Skeleton className="h-6 w-12 rounded" />
      <Skeleton className="h-6 w-12 rounded" />
      <Skeleton className="h-6 w-16 rounded" />
    </div>
  )
}

export function CardLoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={`border-2 border-gray-200 bg-gray-50 rounded-lg p-2 animate-pulse ${className}`}>
      <div className="p-2">
        <Skeleton className="h-3 w-20 mb-1" />
        <Skeleton className="h-2 w-16" />
      </div>
      <div className="p-2 pt-0">
        <ButtonLoadingSkeleton />
      </div>
    </div>
  )
}
