export interface PaymentTransaction {
  id: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled"
  timestamp: Date
  sourceSystem: string
  destinationSystem: string
  transactionType: string
}

export interface SystemNode {
  id: string
  name: string
  type: "gateway" | "processor" | "bank" | "internal"
  status: "online" | "offline" | "maintenance"
  healthScore: number
}

export interface PaymentFlow {
  id: string
  name: string
  nodes: SystemNode[]
  connections: FlowConnection[]
}

export interface FlowConnection {
  id: string
  sourceId: string
  targetId: string
  status: "active" | "inactive" | "error"
  throughput: number
}

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: Date
}
