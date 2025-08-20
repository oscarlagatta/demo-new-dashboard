"use client"

import { Handle, Position } from "@xyflow/react"
import { memo } from "react"

interface CustomNodeData {
  title: string
  subtext?: string
  isSelected?: boolean
  isConnected?: boolean
  isDimmed?: boolean
  onClick?: (nodeId: string) => void
}

interface CustomNodeProps {
  id: string
  data: CustomNodeData
}

function CustomNode({ id, data }: CustomNodeProps) {
  const { title, subtext, isSelected, isConnected, isDimmed, onClick } = data

  const handleClick = () => {
    onClick?.(id)
  }

  return (
    <div
      className={`
        px-4 py-2 shadow-md rounded-md bg-white border-2 cursor-pointer transition-all duration-200
        ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        ${isConnected ? "border-blue-400 bg-blue-25" : ""}
        ${isDimmed ? "opacity-30" : "opacity-100"}
        hover:shadow-lg
      `}
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />

      <div className="text-sm font-medium text-gray-900">{title}</div>
      {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
    </div>
  )
}

export default memo(CustomNode)
