"use client"

import { Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import type { TimingData } from "@/hooks/use-timing-data"

interface E2ETimingHeaderProps {
  timingData: TimingData | undefined
  isLoading: boolean
}

export function E2ETimingHeader({ timingData, isLoading }: E2ETimingHeaderProps) {
  if (isLoading) {
    return (
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center space-x-2">
          <div className="animate-pulse flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!timingData) {
    return null
  }

  const totalNodeTime = timingData.nodes.reduce((sum, node) => sum + (node.averageTime || 0), 0)
  const totalEdgeTime = timingData.edges.reduce((sum, edge) => sum + (edge.averageTime || 0), 0)
  const totalE2ETime = totalNodeTime + totalEdgeTime

  // Calculate SLA status
  const slaThreshold = timingData.slaThreshold || 1000 // Default 1 second
  const slaPercentage = (totalE2ETime / slaThreshold) * 100
  const slaStatus = slaPercentage <= 80 ? "healthy" : slaPercentage <= 100 ? "warning" : "critical"

  // Get status colors and icons
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "healthy":
        return { color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle }
      case "warning":
        return { color: "text-yellow-600", bgColor: "bg-yellow-50", icon: AlertTriangle }
      case "critical":
        return { color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle }
      default:
        return { color: "text-gray-600", bgColor: "bg-gray-50", icon: Clock }
    }
  }

  const statusConfig = getStatusConfig(slaStatus)
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* E2E Time Display */}
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">End-to-End Time</div>
              <div className="text-lg font-bold text-blue-600">{totalE2ETime.toFixed(0)}ms</div>
            </div>
          </div>

          {/* SLA Status */}
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusConfig.bgColor}`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            <div>
              <div className="text-xs font-medium text-gray-600">SLA Status</div>
              <div className={`text-sm font-semibold ${statusConfig.color}`}>
                {slaPercentage.toFixed(1)}% of {slaThreshold}ms
              </div>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-xs font-medium text-gray-600">Avg vs Target</div>
              <div
                className={`text-sm font-semibold ${
                  totalE2ETime <= slaThreshold * 0.8
                    ? "text-green-600"
                    : totalE2ETime <= slaThreshold
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {totalE2ETime <= slaThreshold ? "Within SLA" : "Exceeds SLA"}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Summary */}
        <div className="text-right">
          <div className="text-xs text-gray-500">Processing: {totalNodeTime.toFixed(0)}ms</div>
          <div className="text-xs text-gray-500">Transfer: {totalEdgeTime.toFixed(0)}ms</div>
        </div>
      </div>
    </div>
  )
}
