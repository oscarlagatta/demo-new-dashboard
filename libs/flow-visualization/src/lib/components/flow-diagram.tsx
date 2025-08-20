"use client"
import { useState } from "react"
import { type Node, type Edge, ReactFlowProvider, type NodeTypes, useStore } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import { useGetSplunk } from "@payment-org/data-services"
import { CustomNode } from "./custom-node"
import { SectionBackgroundNode } from "./section-background-node"
import { useTransactionSearchContext } from "@payment-org/transaction-management"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

const SECTION_IDS = ["bg-origination", "bg-validation", "bg-middleware", "bg-processing"]
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35]
const GAP_WIDTH = 16

interface FlowProps {
  flowDataFile?: string
}

const Flow = ({ flowDataFile = "api-data.json" }: FlowProps) => {
  const { showTableView } = useTransactionSearchContext()
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
  const [connectedEdgeIds, setConnectedEdgeIds] = useState<Set<string>>(new Set())
  const [lastRefetch, setLastRefetch] = useState<Date | null>(null)
  const [isLoadingFlowData, setIsLoadingFlowData] = useState(true)

  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  const { data: splunkData, isLoading, isError, error, refetch, isFetching, isSuccess } = useGetSplunk()

  return <div className="h-full w-full relative"></div>
}

export function FlowDiagram({ flowDataFile }: FlowProps) {
  return (
    <ReactFlowProvider>
      <Flow flowDataFile={flowDataFile} />
    </ReactFlowProvider>
  )
}
