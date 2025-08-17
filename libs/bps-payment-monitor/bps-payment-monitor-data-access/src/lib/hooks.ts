import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PaymentMonitorApi } from "./api"
import type { SystemNode } from "./types"

export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: PaymentMonitorApi.getTransactions,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

export const usePaymentFlow = (id: string) => {
  return useQuery({
    queryKey: ["paymentFlow", id],
    queryFn: () => PaymentMonitorApi.getPaymentFlow(id),
    enabled: !!id,
  })
}

export const useSystemNodes = () => {
  return useQuery({
    queryKey: ["systemNodes"],
    queryFn: PaymentMonitorApi.getSystemNodes,
    refetchInterval: 60000, // Refetch every minute
  })
}

export const useUpdateSystemNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SystemNode> }) =>
      PaymentMonitorApi.updateSystemNode(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["systemNodes"] })
    },
  })
}
