import { memo, useMemo } from "react"
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useGetSplunk } from "@/hooks/use-get-splunk"
import { computeTrendColors, getTrendColorClass, type TrendColor } from "@/lib/trend-color-utils"
import { computeTrafficStatusColors, getTrafficStatusColorClass, type TrafficStatusColor } from "@/lib/traffic-status-utils"
import { LoadingButton } from "./loading-button"
import { CardLoadingSkeleton } from "./loading-skeleton"

type ActionType = 'flow' | 'trend' | 'balanced'

type CustomNodeData = {
  title: string
  subtext: string
  size: 'small' | 'medium' | 'large'
  isSelected?: boolean
  isConnected?: boolean
  isDimmed?: boolean
  onClick?: (nodeId: string) => void
  onActionClick?: (aitNum: string, action: ActionType) => void
}

type CustomNodeType = Node<CustomNodeData>

const CustomNode = ({ data, id }: NodeProps<CustomNodeType>) => {
  const { data: splunkData, isLoading, isError, isFetching } = useGetSplunk()
  
  const aitNum = useMemo(() => {
    const match = data.subtext.match(/AIT (\d+)/)
    return match ? match[1] : null
  }, [data.subtext])

  const trendColorMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrendColors(splunkData)
  }, [splunkData])

  const trafficStatusMapping = useMemo(() => {
    if (!splunkData) return {}
    return computeTrafficStatusColors(splunkData)
  }, [splunkData])

  const trendColor: TrendColor = aitNum && trendColorMapping[aitNum] 
    ? trendColorMapping[aitNum] 
    : 'grey'

  const trafficStatusColor: TrafficStatusColor = aitNum && trafficStatusMapping[aitNum]
    ? trafficStatusMapping[aitNum]
    : 'grey'

  const trendColorClass = getTrendColorClass(trendColor)
  const trafficStatusColorClass = getTrafficStatusColorClass(trafficStatusColor)

  const handleCardClick = () => {
    if (data.onClick && id && !isLoading) {
      data.onClick(id)
    }
  }

  const triggerAction = (action: ActionType) => {
    if (!isLoading && !isFetching && aitNum && data.onActionClick) {
      data.onActionClick(aitNum, action)
    }
  }

  const getCardClassName = () => {
    let baseClass = "border-2 border-[rgb(10,49,97)] shadow-md cursor-pointer transition-all duration-200"
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

  if (isLoading) {
    return <CardLoadingSkeleton className="w-full" />
  }

  return (
    <Card className={getCardClassName()} onClick={handleCardClick}>
      <Handle type="target" position={Position.Left} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Right} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Top} className="!bg-gray-400 w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400 w-2 h-2" />
      <CardHeader className="p-2">
        <CardTitle className="text-xs font-bold whitespace-nowrap text-center">
          {data.title}
        </CardTitle>
        <p className="text-[10px] text-muted-foreground text-center">{data.subtext}</p>
      </CardHeader>
      <CardContent className="p-2 pt-0">
        <div className="flex space-x-1">
          <LoadingButton
            isLoading={isFetching}
            loadingText="..."
            variant="outline"
            className={`h-6 px-2 text-[10px] shadow-sm text-white ${isError ? 'bg-gray-400' : trafficStatusColorClass}`}
            onClick={(e) => { e.stopPropagation(); triggerAction('flow') }}
          >
            Flow
          </LoadingButton>
          <LoadingButton
            isLoading={isFetching}
            loadingText="..."
            variant="outline"
            className={`h-6 px-2 text-[10px] shadow-sm text-white ${isError ? 'bg-gray-400' : trendColorClass}`}
            onClick={(e) => { e.stopPropagation(); triggerAction('trend') }}
          >
            Trend
          </LoadingButton>
          <LoadingButton
            isLoading={isFetching}
            loadingText="..."
            variant="outline"
            className="h-6 px-2 text-[10px] shadow-sm bg-transparent"
            onClick={(e) => { e.stopPropagation(); triggerAction('balanced') }}
          >
            Balanced
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(CustomNode)
