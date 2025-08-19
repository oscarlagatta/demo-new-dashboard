"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import type { TimingMetrics, EdgeTimingMetrics } from "@/lib/timing-data-types"

interface TimingOverlayProps {
  nodeId: string
  timingData?: TimingMetrics
  edgeTimingData?: EdgeTimingMetrics[]
  onClose: () => void
}

export function TimingOverlay({ nodeId, timingData, edgeTimingData, onClose }: TimingOverlayProps) {
  if (!timingData) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="absolute top-4 right-20 z-20 max-w-sm bg-white border rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-800">Timing Metrics</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          ×
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Processing Time</span>
            <Badge className={`text-xs ${getStatusColor(timingData.status)}`}>{timingData.status}</Badge>
          </div>
          <div className="text-sm">
            <span className="font-mono">
              {timingData.currentProcessingTime || "N/A"}
              {timingData.unit}
            </span>
            {timingData.averageProcessingTime && (
              <span className="text-gray-500 ml-2">
                (avg: {timingData.averageProcessingTime}
                {timingData.unit})
              </span>
            )}
          </div>
          {timingData.slaThreshold && (
            <div className="text-xs text-gray-500 mt-1">
              SLA: {timingData.slaThreshold}
              {timingData.unit}
            </div>
          )}
        </div>

        {edgeTimingData && edgeTimingData.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Connection Times</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {edgeTimingData.map((edge) => (
                <div key={edge.edgeId} className="text-xs bg-gray-50 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <span>
                      Transfer: {edge.currentTransferTime || "N/A"}
                      {edge.unit}
                    </span>
                    <Badge className={`text-xs ${getStatusColor(edge.status)}`}>{edge.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2 border-t">
          Last updated: {new Date(timingData.lastUpdated).toLocaleTimeString()}
        </div>
      </div>
    </div>
  )
}
