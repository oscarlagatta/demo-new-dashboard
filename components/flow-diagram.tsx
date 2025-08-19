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
import { Loader2, RefreshCw, AlertCircle, Clock } from "lucide-react"

import { useGetSplunk } from "@/hooks/use-get-splunk"
import { loadFlowData } from "@/lib/flow-data-loader"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"
import { computeTrafficStatusColors } from "@/lib/traffic-status-utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { TransactionDetailsTable } from "./transaction-details-table"
import { useTransactionSearchContext } from "./transaction-search-provider"
import { useTimingData } from "@/hooks/use-timing-data"
import { TimingOverlay } from "./timing-overlay"

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
  const [showTimingOverlay, setShowTimingOverlay] = useState(false)
  const [timingMode, setTimingMode] = useState(false)

  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  const { data: splunkData, isLoading, isError, error, refetch, isFetching, isSuccess } = useGetSplunk()
  const { data: timingData, isLoading: isLoadingTiming } = useTimingData(timingMode)

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingFlowData(true)
      try {
        const { nodes: loadedNodes, edges: loadedEdges } = await loadFlowData(flowDataFile)
        setNodes(loadedNodes)
        setEdges(loadedEdges)
      } catch (error) {
        console.error("Failed to load flow data:", error)
      } finally {
        setIsLoadingFlowData(false)
      }
    }

    loadData()
  }, [flowDataFile])

  const handleRefetch = async () => {
    try {
      await refetch()
      setLastRefetch(new Date())
    } catch (error) {
      console.error("Refetch failed:", error)
    }
  }

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
      if (isLoading || isFetching) return

      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null)
        setConnectedNodeIds(new Set())
        setConnectedEdgeIds(new Set())
        setShowTimingOverlay(false)
      } else {
        const { connectedNodes, connectedEdges } = findConnections(nodeId)
        setSelectedNodeId(nodeId)
        setConnectedNodeIds(connectedNodes)
        setConnectedEdgeIds(connectedEdges)
        setShowTimingOverlay(true)
      }
    },
    [selectedNodeId, findConnections, isLoading, isFetching],
  )

  const getConnectedSystemNames = useCallback(() => {
    if (!selectedNodeId) return []

    return Array.from(connectedNodeIds)
      .map((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId)
        return node?.data?.title || nodeId
      })
      .sort()
  }, [selectedNodeId, connectedNodeIds, nodes])

  useEffect(() => {
    if (width > 0 && height > 0) {
      setNodes((currentNodes) => {
        const totalGapWidth = GAP_WIDTH * (SECTION_IDS.length - 1)
        const availableWidth = width - totalGapWidth
        let currentX = 0

        const newNodes = [...currentNodes]
        const sectionDimensions: Record<string, { x: number; width: number }> = {}

        for (let i = 0; i < SECTION_IDS.length; i++) {
          const sectionId = SECTION_IDS[i]
          const nodeIndex = newNodes.findIndex((n) => n.id === sectionId)

          if (nodeIndex !== -1) {
            const sectionWidth = availableWidth * SECTION_WIDTH_PROPORTIONS[i]
            sectionDimensions[sectionId] = { x: currentX, width: sectionWidth }

            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: { x: currentX, y: 0 },
              style: {
                ...newNodes[nodeIndex].style,
                width: `${sectionWidth}px`,
                height: `${height}px`,
              },
            }
            currentX += sectionWidth + GAP_WIDTH
          }
        }

        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]
          if (node.parentId && sectionDimensions[node.parentId]) {
            const parentDimensions = sectionDimensions[node.parentId]

            const originalNode = currentNodes.find((n) => n.id === node.id)
            const originalParent = currentNodes.find((n) => n.id === node.parentId)

            if (originalNode && originalParent && originalParent.style?.width) {
              const originalParentWidth = Number.parseFloat(originalParent.style.width as string)
              const originalRelativeXOffset = originalNode.position.x - originalParent.position.x

              const newAbsoluteX =
                parentDimensions.x + (originalRelativeXOffset / originalParentWidth) * parentDimensions.width

              newNodes[i] = {
                ...node,
                position: {
                  x: newAbsoluteX,
                  y: node.position.y,
                },
              }
            }
          }
        }
        return newNodes
      })
    }
  }, [width, height])

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

      const nodeTimingData = timingData?.nodes.find((t) => t.nodeId === node.id)
      const hasTimingIssue = nodeTimingData?.status === "warning" || nodeTimingData?.status === "critical"

      const nodeData = {
        ...node.data,
        isSelected,
        isConnected,
        isDimmed,
        onClick: handleNodeClick,
        timingData: nodeTimingData,
        showTiming: timingMode,
        hasTimingIssue,
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
  }, [nodes, selectedNodeId, connectedNodeIds, handleNodeClick, timingData, timingMode])

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

  const renderDataPanel = () => {
    if (isLoading || isLoadingTiming) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Loading data...</span>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Error loading data</span>
          </div>
          <p className="text-sm text-red-500">{error?.message || "Failed to load data"}</p>
          <Button
            onClick={handleRefetch}
            size="sm"
            variant="outline"
            disabled={isFetching}
            className="w-full border-red-200 hover:border-red-300 hover:bg-red-50 bg-transparent"
          >
            {isFetching ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-3 w-3" />
                Retry Connection
              </>
            )}
          </Button>
        </div>
      )
    }

    if (isSuccess && splunkData) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-medium mb-1">Traffic Status Summary:</h4>
            <div className="flex items-center gap-1">
              {isFetching && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
              <Button
                onClick={handleRefetch}
                size="sm"
                variant="ghost"
                disabled={isFetching}
                className="h-5 w-5 p-0 hover:bg-blue-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          <div className="text-xs bg-gray-50 p-2 rounded">
            {Object.entries(computeTrafficStatusColors(splunkData)).map(([aitNum, color]) => (
              <div key={aitNum} className="flex justify-between">
                <span>AIT {aitNum}:</span>
                <span
                  className={`px-1 rounded text-white ${
                    color === "green" ? "bg-green-500" : color === "red" ? "bg-red-500" : "bg-gray-400"
                  }`}
                >
                  {color}
                </span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-medium mb-1">Raw Data (first 5 entries):</h4>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(splunkData.slice(0, 5), null, 2)}
            </pre>
          </div>
        </div>
      )
    }

    return null
  }

  if (showTableView) {
    return <TransactionDetailsTable />
  }

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

  return (
    <div className="h-full w-full relative">
      {/* Refresh Data Button - Icon only, docked top-right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <Button
          onClick={() => setTimingMode(!timingMode)}
          variant={timingMode ? "default" : "outline"}
          size="sm"
          className="h-8 px-3 shadow-sm"
          title="Toggle timing mode"
        >
          <Clock className="h-4 w-4 mr-1" />
          Timing
        </Button>
        {lastRefetch && !isFetching && (
          <span className="text-xs text-muted-foreground">Last updated: {lastRefetch.toLocaleTimeString()}</span>
        )}
        <Button
          onClick={handleRefetch}
          disabled={isFetching}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 shadow-sm border-blue-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
          title="Refresh Splunk data"
          aria-label="Refresh Splunk data"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

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

      {/* Selected panel */}
      {selectedNodeId && (
        <div className="absolute top-4 left-4 z-10 max-w-sm bg-white border rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-800">
            Selected System: {nodes.find((n) => n.id === selectedNodeId)?.data?.title}
          </h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">Connected Systems ({connectedNodeIds.size}):</h4>
              <div className="max-h-32 overflow-y-auto">
                {getConnectedSystemNames().map((systemName, index) => (
                  <div key={index} className="text-xs text-gray-700 py-1 px-2 bg-blue-50 rounded mb-1">
                    {systemName}
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleNodeClick(selectedNodeId)}
              className="text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              disabled={isLoading || isFetching}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Timing Overlay */}
      {selectedNodeId && showTimingOverlay && timingMode && (
        <TimingOverlay
          nodeId={selectedNodeId}
          timingData={timingData?.nodes.find((t) => t.nodeId === selectedNodeId)}
          edgeTimingData={timingData?.edges.filter((e) =>
            edges.some(
              (edge) => (edge.source === selectedNodeId || edge.target === selectedNodeId) && edge.id === e.edgeId,
            ),
          )}
          onClose={() => setShowTimingOverlay(false)}
        />
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
