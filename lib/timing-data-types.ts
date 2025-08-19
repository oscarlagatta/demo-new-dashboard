export interface TimingMetrics {
  nodeId: string
  currentProcessingTime?: number
  averageProcessingTime?: number
  averageTime?: number // Added alias for consistency with E2E calculations
  slaThreshold?: number
  status: "normal" | "warning" | "critical"
  lastUpdated: string
  unit: "ms" | "s" | "min"
}

export interface EdgeTimingMetrics {
  edgeId: string
  currentTransferTime?: number
  averageTransferTime?: number
  averageTime?: number // Added alias for consistency with E2E calculations
  maxTransferTime?: number
  status: "normal" | "slow" | "timeout"
  lastUpdated: string
  unit: "ms" | "s" | "min"
}

export interface TimingData {
  nodes: TimingMetrics[]
  edges: EdgeTimingMetrics[]
  slaThreshold?: number // Added global SLA threshold for E2E calculations
  timestamp: string
}
