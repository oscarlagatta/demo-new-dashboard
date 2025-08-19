"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnConnect,
  MarkerType,
  ReactFlowProvider,
  type NodeTypes,
  useStore,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'

import { loadFlowData } from "@/lib/flow-data-loader"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"
import { Button } from "@/components/ui/button"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

interface FlowProps {
  flowDataFile?: string
}

const Flow = ({ flowDataFile = "api-data.json" }: FlowProps) => {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
  const [connectedEdgeIds, setConnectedEdgeIds] = useState<Set<string>>(new Set())
  const [isLoadingFlowData, setIsLoadingFlowData] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  // Load flow data when flowDataFile changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingFlowData(true)
      setLoadError(null)
      
      try {
        console.log(`[v0] Loading flow data from ${flowDataFile}`)
        const { nodes: loadedNodes, edges: loadedEdges } = await loadFlowData(flowDataFile)
        setNodes(loadedNodes)
        setEdges(loadedEdges)
        console.log(`[v0] Successfully loaded ${loadedNodes.length} nodes and ${loadedEdges.length} edges`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load flow data'
        console.error("[v0] Failed to load flow data:", error)
        setLoadError(errorMessage)
        setNodes([])
        setEdges([])
      } finally {
        setIsLoadingFlowData(false)
      }
    }

    loadData()
  }, [flowDataFile])

  const findConnections = useCallback(
    (nodeId: string) => {
      const connectedNodes = new Set<string>()
      const connectedEdges = new Set<string>()

      edges.forEach((edge) => {
        if (edge.source === nodeId || edge.target === nodeId) {
          connectedEdges.add(edge.id)
          if (edge.source === nodeId) {
            connectedNodes.add(edge.target)
          }
          if (edge.target === nodeId) {
            connectedNodes.add(edge.source)
          }
        }
      })

      return { connectedNodes, connectedEdges }
    },
    [edges],
  )

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
        setConnectedNodeIds(new Set())
        setConnectedEdgeIds(new Set())
      } else {
        const { connectedNodes, connectedEdges } = findConnections(nodeId)
        setSelectedNodeId(nodeId)
        setConnectedNodeIds(connectedNodes)
        setConnectedEdgeIds(connectedEdges)
      }
    },
    [selectedNodeId, findConnections],
  )

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes])
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges])

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            markerStart: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
            style: { strokeWidth: 2, stroke: "#6b7280" },
          },
          eds,
        ),
      ),
    [setEdges],
  )

  const nodesForFlow = useMemo(() => {
    return nodes.map((node) => {
      const isSelected = selectedNodeId === node.id
      const isConnected = connectedNodeIds.has(node.id)
      const isDimmed = selectedNodeId && !isSelected && !isConnected

      const nodeData = {
        ...node.data,
        isSelected,
        isConnected,
        isDimmed,
        onClick: handleNodeClick,
      }

      if (node.parentId) {
        const { parentId, ...rest } = node
        return {
          ...rest,
          parentNode: parentId,
          data: nodeData,
        }
      }
      return {
        ...(node as Node),
        data: nodeData,
      }
    })
  }, [nodes, selectedNodeId, connectedNodeIds, handleNodeClick])

  const edgesForFlow = useMemo(() => {
    return edges.map((edge) => {
      const isConnected = connectedEdgeIds.has(edge.id)
      const isDimmed = selectedNodeId && !isConnected

      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isConnected ? 3 : 2,
          stroke: isConnected ? "#1d4ed8" : isDimmed ? "#d1d5db" : "#6b7280",
          opacity: isDimmed ? 0.3 : 1,
        },
        animated: isConnected,
      }
    })
  }, [edges, connectedEdgeIds, selectedNodeId])

  // Loading state
  if (isLoadingFlowData) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-sm font-medium text-blue-600">Loading flow diagram...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span className="text-lg font-medium">Error Loading Flow Data</span>
          </div>
          <p className="text-sm text-red-500 max-w-md">{loadError}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodesForFlow}
        edges={edgesForFlow}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        className="bg-white"
        style={{ background: "#eeeff3ff" }}
        panOnDrag={false}
        elementsSelectable={false}
        minZoom={1}
        maxZoom={1}
      >
        <Controls />
        <Background gap={16} size={1} />
      </ReactFlow>

      {/* Selected node panel */}
      {selectedNodeId && (
        <div className="absolute top-4 left-4 z-10 max-w-sm bg-white border rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-800">
            Selected System: {nodes.find((n) => n.id === selectedNodeId)?.data?.title}
          </h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Connected Systems ({connectedNodeIds.size}):</h4>
              <div className="max-h-32 overflow-y-auto">
                {Array.from(connectedNodeIds).map((nodeId) => {
                  const node = nodes.find((n) => n.id === nodeId)
                  return (
                    <div key={nodeId} className="text-xs text-gray-700 py-1 px-2 bg-blue-50 rounded mb-1">
                      {node?.data?.title || nodeId}
                    </div>
                  )
                })}
              </div>
            </div>
            <button
              onClick={() => handleNodeClick(selectedNodeId)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function FlowDiagram({ flowDataFile }: FlowProps) {
  return (
    <ReactFlowProvider>
      <Flow flowDataFile={flowDataFile} />
    </ReactFlowProvider>
  )
}


/*
**Dynamic Data Loading**: Loads different JSON files based on props
**Interactive Node Selection**: Click nodes to highlight connections
**Loading & Error States**: Proper handling of loading and error conditions
**Connection Visualization**: Highlights connected nodes and edges
**Responsive Layout**: Adapts to container size changes
*/
