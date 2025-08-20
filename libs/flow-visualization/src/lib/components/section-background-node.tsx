"use client"

import { memo } from "react"

interface SectionBackgroundNodeData {
  title: string
}

interface SectionBackgroundNodeProps {
  data: SectionBackgroundNodeData
}

function SectionBackgroundNode({ data }: SectionBackgroundNodeProps) {
  return (
    <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-start justify-center p-4">
      <h3 className="text-lg font-semibold text-gray-600 text-center">{data.title}</h3>
    </div>
  )
}

export default memo(SectionBackgroundNode)
