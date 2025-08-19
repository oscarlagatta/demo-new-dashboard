export interface TimingMetrics {
  nodeId: string
  currentProcessingTime?: number
  averageProcessingTime?: number
  slaThreshold?: number
  status: "normal" | "warning" | "critical"
  lastUpdated: string
  unit: "ms" | "s" | "min"
}

export interface EdgeTimingMetrics {
  edgeId: string
  currentTransferTime?: number
  averageTransferTime?: number
  maxTransferTime?: number
  status: "normal" | "slow" | "timeout"
  lastUpdated: string
  unit: "ms" | "s" | "min"
}

export interface TimingData {
  nodes: TimingMetrics[]
  edges: EdgeTimingMetrics[]
  timestamp: string
}
