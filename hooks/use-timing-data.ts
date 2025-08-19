import { useQuery } from "@tanstack/react-query"
import type { TimingData } from "@/lib/timing-data-types"

export function useTimingData(enabled = true) {
  return useQuery({
    queryKey: ["timing-data"],
    queryFn: async (): Promise<TimingData> => {
      // This would integrate with your real-time data source
      const response = await fetch("/api/timing-data")
      if (!response.ok) {
        throw new Error("Failed to fetch timing data")
      }
      return response.json()
    },
    enabled,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
    staleTime: 2000,
  })
}
