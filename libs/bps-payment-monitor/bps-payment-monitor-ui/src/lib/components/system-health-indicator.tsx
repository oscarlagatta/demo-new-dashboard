import type React from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SystemHealthIndicatorProps {
  systemName: string
  status: "online" | "offline" | "maintenance"
  healthScore: number
  className?: string
}

export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({
  systemName,
  status,
  healthScore,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-400"
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return "bg-green-500"
    if (score >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className={`flex items-center space-x-4 p-4 border rounded-lg ${className}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{systemName}</h3>
          <Badge className={`${getStatusColor(status)} text-white`}>{status.toUpperCase()}</Badge>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Health Score</span>
            <span>{healthScore}%</span>
          </div>
          <Progress
            value={healthScore}
            className="h-2"
            style={{
              backgroundColor: "#e5e7eb",
            }}
          />
        </div>
      </div>
    </div>
  )
}
