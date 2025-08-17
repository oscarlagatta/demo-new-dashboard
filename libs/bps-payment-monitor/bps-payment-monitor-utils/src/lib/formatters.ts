export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date)
}

export const formatTransactionId = (id: string): string => {
  // Format transaction ID for display (e.g., TXN-123456 -> TXN-12...56)
  if (id.length <= 10) return id
  return `${id.substring(0, 6)}...${id.substring(id.length - 4)}`
}

export const formatBytes = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Bytes"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`
}
