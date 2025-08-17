export const PAYMENT_STATUSES = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const

export const SYSTEM_TYPES = {
  GATEWAY: "gateway",
  PROCESSOR: "processor",
  BANK: "bank",
  INTERNAL: "internal",
} as const

export const SYSTEM_STATUSES = {
  ONLINE: "online",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
} as const

export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY", "SEK", "NZD"] as const

export const REFRESH_INTERVALS = {
  TRANSACTIONS: 30000, // 30 seconds
  SYSTEM_HEALTH: 60000, // 1 minute
  FLOW_STATUS: 15000, // 15 seconds
} as const

export const API_ENDPOINTS = {
  TRANSACTIONS: "/api/bps-payment-monitor/transactions",
  FLOWS: "/api/bps-payment-monitor/flows",
  NODES: "/api/bps-payment-monitor/nodes",
  HEALTH: "/api/bps-payment-monitor/health",
} as const
