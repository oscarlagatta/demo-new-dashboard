"use client"

import type React from "react"

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
  const { active: txActive, isFetching: txFetching, matchedAitIds, showTable } = useTransactionSearchContext()

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

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent node selection
    if (aitNum) {
      showTable(aitNum)
    }
  }

  // Determine styling based on selection state and loading
  const getCardClassName = () => {
    let baseClass = "border-2 border-slate-300 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md"

    // Loading state styling
    if (isLoading || isFetching) {
      baseClass += " bg-slate-50"
    } else if (isError) {
      baseClass += " bg-red-50 border-red-200"
    } else {
      baseClass += " bg-white"
    }

    if (data.isSelected && !isLoading) {
      baseClass += " ring-2 ring-slate-600 shadow-lg scale-105 border-slate-600"
    } else if (data.isConnected && !isLoading) {
      baseClass += " ring-2 ring-slate-400 shadow-md border-slate-400"
    } else if (data.isDimmed) {
      baseClass += " opacity-40"
    }

    return baseClass
  }

  // Show loading skeleton during initial load of Splunk (baseline) data
  if (isLoading) {
    return <CardLoadingSkeleton className="w-full" />
  }

  // Three-phase UI logic for buttons:
  // 1) Default mode (no txActive): show Flow/Trend/Balanced
  // 2) Loading mode (txActive && txFetching): show Summary/Details (loading) on all nodes to indicate a fetch is happening
  // 3) Results mode (txActive && !txFetching): show Summary/Details only on AITs present in matchedAitIds, show NO buttons otherwise
  const inDefaultMode = !txActive
  const inLoadingMode = txActive && txFetching
  const inResultsMode = txActive && !txFetching
  const isMatched = !!aitNum && matchedAitIds.has(aitNum)

  return (
    <Card className={getCardClassName()} onClick={handleClick}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400 w-2 h-2" />
      <Handle type="source" position={Position.Top} className="!bg-slate-400 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 w-2 h-2" />
      <CardHeader className="p-3">
        <CardTitle className="text-xs font-bold whitespace-nowrap text-center text-slate-900">{data.title}</CardTitle>
        <p className="text-[10px] text-slate-600 text-center font-medium">{data.subtext}</p>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="flex space-x-1 transition-all duration-200">
          {inDefaultMode && (
            <>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm text-white border-0 font-medium ${
                  isError ? "bg-slate-400" : trafficStatusColorClass
                }`}
              >
                Flow
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className={`h-6 px-2 text-[10px] shadow-sm text-white border-0 font-medium ${isError ? "bg-slate-400" : trendColorClass}`}
              >
                Trend
              </LoadingButton>
              <LoadingButton
                isLoading={isFetching}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 font-medium"
              >
                Balanced
              </LoadingButton>
            </>
          )}

          {inLoadingMode && (
            <>
              <LoadingButton
                isLoading={true}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-slate-600 text-white hover:bg-slate-700 hover:text-white border-slate-600 font-medium"
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={true}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-slate-600 text-white hover:bg-slate-700 hover:text-white border-slate-600 font-medium"
              >
                Details
              </LoadingButton>
            </>
          )}

          {inResultsMode && isMatched && (
            <>
              <LoadingButton
                isLoading={false}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-slate-600 text-white hover:bg-slate-700 hover:text-white border-slate-600 font-medium"
              >
                Summary
              </LoadingButton>
              <LoadingButton
                isLoading={false}
                loadingText="..."
                variant="outline"
                className="h-6 px-2 text-[10px] shadow-sm bg-slate-600 text-white hover:bg-slate-700 hover:text-white border-slate-600 font-medium"
                onClick={handleDetailsClick}
              >
                Details
              </LoadingButton>
            </>
          )}
          {/* inResultsMode && !isMatched => render nothing for a clean, focused UI */}
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CustomNode)
