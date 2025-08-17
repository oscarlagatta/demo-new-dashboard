import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PaymentStatusCardProps {
  title: string
  amount: number
  currency: string
  status: "pending" | "completed" | "failed" | "cancelled"
  timestamp: Date
  className?: string
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  title,
  amount,
  currency,
  status,
  timestamp,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "failed":
        return "bg-red-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Badge className={`${getStatusColor(status)} text-white`}>{status.toUpperCase()}</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {amount.toLocaleString()} {currency}
        </div>
        <p className="text-xs text-muted-foreground">{timestamp.toLocaleString()}</p>
      </CardContent>
    </Card>
  )
}
