import type { NodeProps, Node } from "@xyflow/react"

type SectionBackgroundNodeData = {
  title: string
  color: string
  isDimmed?: boolean
}

type SectionBackgroundNodeType = Node<SectionBackgroundNodeData>

const SectionBackgroundNode = ({ data }: NodeProps<SectionBackgroundNodeType>) => {
  return (
    <div
      className={`h-full w-full rounded-lg bg-white border border-slate-200 shadow-sm transition-all duration-200 ${
        data.isDimmed ? "opacity-60" : ""
      }`}
    >
      <div className="p-5">
        <h2 className="text-lg font-semibold text-slate-700 tracking-tight">{data.title}</h2>
      </div>
    </div>
  )
}

export default SectionBackgroundNode
