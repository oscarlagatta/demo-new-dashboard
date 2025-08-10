"use client"

import { memo, useMemo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useGetSplunk } from "@/hooks/use-get-splunk"
import { computeTrendColors, getTrendColorClass, type TrendColor } from "@/lib/trend-color-utils"
import {
  computeTrafficStatusColors,
  getTrafficStatusColorClass,
  type TrafficStatusColor,
} from "@/lib/traffic-status-utils"
import { LoadingButton } from "./loading-button"
import { CardLoadingSkeleton } from "./loading-skeleton"
import { useTransactionSearchContext } from "@/components/transaction-search-provider"

type CustomNodeData = {
  title: string
  subtext: string
  size: "small" | "medium" | "large"
  isSelected?: boolean
  isConnected?: boolean
  isDimmed?: boolean
  onClick?: (nodeId: string) => void
}

type CustomNodeType = Node<CustomNodeData>

const CustomNode = ({ data, id }: NodeProps<CustomNodeType>) => {
  const { data: splunkData, isLoading, isError, isFetching } = useGetSplunk()
  const { active: txActive, isFetching: txFetching } = useTransactionSearchContext()

  // Extract AIT number from the node data subtext (format: "AIT {number}")
  const aitNum = useMemo(() => {
    const match = data.subtext.match(/AIT (\d+)/)
    return match ? match[1] : null
  }, [data.subtext])

  // Compute trend colors from Splunk data
  const trendColorMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrendColors(splunkData)
  }, [splunkData])

  // Compute traffic status colors from Splunk data
  const trafficStatusMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrafficStatusColors(splunkData)
  }, [splunkData])

  // Get the trend color for this specific node
  const trendColor: TrendColor = aitNum && trendColorMapping[aitNum] ? trendColorMapping[aitNum] : "grey"

  // Get the traffic status color for this specific node
  const trafficStatusColor: TrafficStatusColor =
    aitNum && trafficStatusMapping[aitNum] ? trafficStatusMapping[aitNum] : "grey"

  const trendColorClass = getTrendColorClass(trendColor)
  const trafficStatusColorClass = getTrafficStatusColorClass(trafficStatusColor)

  const handleClick = () => {
    if (data.onClick && id && !isLoading) {
      data.onClick(id)
    }
  }

  // Determine styling based on selection state and loading
  const getCardClassName = () => {
    let baseClass = "border-2 border-[rgb(10,49,97)] shadow-md cursor-pointer transition-all duration-200"

    // Loading state styling
    if (isLoading || isFetching) {
      baseClass += " bg-gray-50"
    } else if (isError) {
      baseClass += " bg-red-50 border-red-200"
    } else {
      baseClass += " bg-gray-100"
    }

    if (data.isSelected && !isLoading) {
      baseClass += " ring-2 ring-blue-700 shadow-lg scale-105"
    } else if (data.isConnected && !isLoading) {
      baseClass += " ring-2 ring-blue-300 shadow-lg"
    } else if (data.isDimmed) {
      baseClass += " opacity-40"
    }

    return baseClass
  }

  // Show loading skeleton during initial load
  if (isLoading) {
    return <CardLoadingSkeleton className="w-full" />
  }

  const showTransactionButtons = txActive
  const transactionLoading = txFetching

  return (
    <Card className={getCardClassName()} onClick={handleClick}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Top} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 w-2 h-2" />
      <CardHeader className="p-2">
        <CardTitle className="text-xs font-bold whitespace-nowrap text-center">{data.title}</CardTitle>
        <p className="text-[10px] text-muted-foreground text-center">{data.subtext}</p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex space-x-1 transition-all duration-200">
          {showTransactionButtons ? (
            <>
              <LoadingButton
                isLoading={transactionLoading}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={transactionLoading}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-blue-600"
              >
                Details
              </LoadingButton>
            </>
          ) : (
            <>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm text-white ${
                  isError ? "bg-gray-400" : trafficStatusColorClass
                }`}
              >
                Flow
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm text-white ${isError ? "bg-gray-400" : trendColorClass}`}
              >
                Trend
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-transparent"
              >
                Balanced
              </LoadingButton>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CustomNode)
