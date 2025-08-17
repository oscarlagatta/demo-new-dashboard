"use client"

import { memo } from "react"
import type { NodeProps, Node } from "@xyflow/react"

type SectionBackgroundNodeData = {
  title: string
}

type SectionBackgroundNodeType = Node<SectionBackgroundNodeData>

export const SectionBackgroundNode = ({ data }: NodeProps<SectionBackgroundNodeType>) => {
  return (
    <div className="w-full h-full bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center opacity-30">
      <span className="text-gray-600 font-semibold text-lg">{data.title}</span>
    </div>
  )
}

export default memo(SectionBackgroundNode)
