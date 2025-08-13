'use client'

import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useGetSplunk } from "@/hooks/use-get-splunk"
import { useState, useEffect } from "react"

interface RefetchButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg"
  showLabel?: boolean
  className?: string
}

export function RefetchButton({ 
  variant = "outline", 
  size = "default", 
  showLabel = true,
  className = ""
}: RefetchButtonProps) {
  const { refetch, isFetching, isError, isSuccess } = useGetSplunk()
  const [lastRefetch, setLastRefetch] = useState<Date | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleRefetch = async () => {
    try {
      await refetch()
      setLastRefetch(new Date())
      setShowSuccess(true)
    } catch (error) {
      console.error('Refetch failed:', error)
    }
  }

  // Hide success indicator after 2 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess])

  const getButtonContent = () => {
    if (isFetching) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && <span className="ml-2">Refreshing...</span>}
        </>
      )
    }

    if (showSuccess && isSuccess) {
      return (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          {showLabel && <span className="ml-2">Updated</span>}
        </>
      )
    }

    if (isError) {
      return (
        <>
          <AlertCircle className="h-4 w-4 text-red-500" />
          {showLabel && <span className="ml-2">Retry</span>}
        </>
      )
    }

    return (
      <>
        <RefreshCw className="h-4 w-4" />
        {showLabel && <span className="ml-2">Refresh Data</span>}
      </>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={handleRefetch}
        disabled={isFetching}
        variant={variant}
        size={size}
        className={`transition-all duration-200 ${className}`}
        title="Refresh Splunk data"
        aria-label="Refresh Splunk data"
      >
        {getButtonContent()}
      </Button>
      
      {lastRefetch && !isFetching && (
        <span className="text-xs text-muted-foreground">
          Last updated: {lastRefetch.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
