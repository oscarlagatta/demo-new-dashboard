"use client"

import { Skeleton } from "../../../../../components/ui/skeleton"
import { Card, CardHeader, CardContent } from "../../../../../components/ui/card"

interface CardLoadingSkeletonProps {
  className?: string
}

export function CardLoadingSkeleton({ className }: CardLoadingSkeletonProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-2">
        <Skeleton className="h-4 w-20 mx-auto" />
        <Skeleton className="h-3 w-16 mx-auto" />
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex space-x-1">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
