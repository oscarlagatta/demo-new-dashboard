import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

export interface GroupNodeData {
  label: string
  width: number
  height: number
}

const GroupNode = memo(({ data }: NodeProps<GroupNodeData>) => {
  return (
    <div
      className="group-node border-2 border-dashed border-slate-300 bg-slate-50/30 rounded-lg backdrop-blur-sm"
      style={{
        width: data.width,
        height: data.height,
        position: "relative",
      }}
    >
      <div className="absolute top-2 left-3 text-xs font-medium text-slate-600 bg-white/80 px-2 py-1 rounded border border-slate-200">
        {data.label}
      </div>
      {/* Invisible handles for potential connections */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  )
})

GroupNode.displayName = "GroupNode"

export default GroupNode
