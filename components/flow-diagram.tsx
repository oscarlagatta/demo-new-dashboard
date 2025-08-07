"use client"

import type React from "react"
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
  type OnNodesChange,
  type OnEdgesChange,
  MarkerType,
  ReactFlowProvider,
  type NodeTypes,
  useStore,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { useGetSplunk } from "@/hooks/use-get-splunk"
import { initialNodes, initialEdges, type AppNode } from "@/lib/flow-data"
import CustomNode from "./custom-node"
import SectionBackgroundNode from "./section-background-node"
import { computeTrafficStatusColors } from "@/lib/traffic-status-utils"

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  background: SectionBackgroundNode,
}

const SECTION_IDS = ["bg-origination", "bg-validation", "bg-middleware", "bg-processing"]
const SECTION_WIDTH_PROPORTIONS = [0.2, 0.2, 0.25, 0.35]
const GAP_WIDTH = 16

const Flow = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes)
  const [edges, setEdges] = useState<Edge[]>(initialEdges)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectedNodeIds, setConnectedNodeIds] = useState<Set<string>>(new Set())
  const [connectedEdgeIds, setConnectedEdgeIds] = useState<Set<string>>(new Set())
  
  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  // Add Splunk data fetching
  const { data: splunkData, isLoading, isError, error } = useGetSplunk()

  // Function to find connected nodes and edges
  const findConnections = useCallback((nodeId: string) => {
    const connectedNodes = new Set<string>()
    const connectedEdges = new Set<string>()
    
    edges.forEach(edge => {
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
  }, [edges])

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    if (selectedNodeId === nodeId) {
      // Clicking the same node deselects it
      setSelectedNodeId(null)
      setConnectedNodeIds(new Set())
      setConnectedEdgeIds(new Set())
    } else {
      // Select new node and find its connections
      const { connectedNodes, connectedEdges } = findConnections(nodeId)
      setSelectedNodeId(nodeId)
      setConnectedNodeIds(connectedNodes)
      setConnectedEdgeIds(connectedEdges)
    }
  }, [selectedNodeId, findConnections])

  // Get connected system names for display
  const getConnectedSystemNames = useCallback(() => {
    if (!selectedNodeId) return []
    
    return Array.from(connectedNodeIds).map(nodeId => {
      const node = nodes.find(n => n.id === nodeId)
      return node?.data?.title || nodeId
    }).sort()
  }, [selectedNodeId, connectedNodeIds, nodes])

  useEffect(() => {
    if (width > 0 && height > 0) {
      setNodes((currentNodes) => {
        const totalGapWidth = GAP_WIDTH * (SECTION_IDS.length - 1)
        const availableWidth = width - totalGapWidth
        let currentX = 0

        const newNodes = [...currentNodes]
        const sectionDimensions: Record<string, { x: number; width: number }> = {}

        // first pass: update background nodes and store their new dimensions
        for (let i = 0; i < SECTION_IDS.length; i++) {
          const sectionId = SECTION_IDS[i]
          const nodeIndex = newNodes.findIndex((n) => n.id === sectionId)

          if (nodeIndex !== -1) {
            const sectionWidth = availableWidth * SECTION_WIDTH_PROPORTIONS[i]
            sectionDimensions[sectionId] = {x: currentX, width: sectionWidth}

            newNodes[nodeIndex] = {
              ...newNodes[nodeIndex],
              position: {x: currentX, y: 0},
              style: {
                ...newNodes[nodeIndex].style,
                width: `${sectionWidth}px`,
                height: `${height}px`,
              },
            }
            currentX += sectionWidth + GAP_WIDTH
          }
        }

        // second pass: update child nodes based on their parent's new dimensions
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i]
          if (node.parentId && sectionDimensions[node.parentId]) {
            const parentDimensions = sectionDimensions[node.parentId]

            const originalNode = initialNodes.find((n) => n.id === node.id)
            const originalParent = initialNodes.find((n) => n.id === node.parentId)

            if (originalNode && originalParent && originalParent.style?.width) {
              const originalParentWidth = Number.parseFloat(originalParent.style.width as string)
              const originalRelativeXOffset = originalNode.position.x - originalParent.position.x

              const newAbsoluteX =
                  parentDimensions.x +
                  (originalRelativeXOffset / originalParentWidth) *
                  parentDimensions.width

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
      });
    }
  }, [width, height]);

  const onNodesChange: OnNodesChange = useCallback(
      (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
      [setNodes],
  )

  const onEdgesChange: OnEdgesChange = useCallback(
      (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
      [setEdges],
  )

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
      
      let nodeData = {
        ...node.data,
        isSelected,
        isConnected,
        isDimmed,
        onClick: handleNodeClick
      }
      
      if (node.parentId) {
        const { parentId, ...rest } = node
        return { 
          ...rest, 
          parentNode: parentId,
          data: nodeData
        }
      }
      return { 
        ...node as Node, 
        data: nodeData
      }
    })
  }, [nodes, selectedNodeId, connectedNodeIds, handleNodeClick])

  const edgesForFlow = useMemo(() => {
    return edges.map(edge => {
      const isConnected = connectedEdgeIds.has(edge.id)
      const isDimmed = selectedNodeId && !isConnected
      
      return {
        ...edge,
        style: {
          ...edge.style,
          strokeWidth: isConnected ? 3 : 2,
          stroke: isConnected ? '#1d4ed8' : isDimmed ? '#d1d5db' : '#6b7280',
          opacity: isDimmed ? 0.3 : 1,
        },
        animated: isConnected,
      }
    })
  }, [edges, connectedEdgeIds, selectedNodeId])

  return (
    <div className="h-full w-full relative">
      {/* Splunk Data Display */}
      <div className="absolute top-4 right-4 z-10 max-w-md max-h-96 overflow-auto bg-white border rounded-lg shadow-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Splunk Data Analysis</h3>
        {isLoading && <p className="text-sm text-gray-500">Loading Splunk data...</p>}
        {isError && (
          <p className="text-sm text-red-500">
            Error loading data: {error?.message || 'Unknown error'}
          </p>
        )}
        {splunkData && (
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium mb-1">Traffic Status Summary:</h4>
              <div className="text-xs bg-gray-50 p-2 rounded">
                {Object.entries(computeTrafficStatusColors(splunkData)).map(([aitNum, color]) => (
                  <div key={aitNum} className="flex justify-between">
                    <span>AIT {aitNum}:</span>
                    <span className={`px-1 rounded text-white ${
                      color === 'green' ? 'bg-green-500' : 
                      color === 'red' ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-medium mb-1">Raw Data (first 5 entries):</h4>
              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(splunkData.slice(0, 5), null, 2)}
              </pre>
            </div>
          </div>
        )}
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
        style={{background: '#eeeff3ff'}}
        panOnDrag={false}
        elementsSelectable={false}
        minZoom={1}
        maxZoom={1}
      >
        <Controls />
        <Background gap={16} size={1} />
      </ReactFlow>
      {/* Connected Systems Panel */}
      {selectedNodeId && (
        <div className="absolute top-4 left-4 z-10 max-w-sm bg-white border rounded-lg shadow-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-gray-800">
            Selected System: {nodes.find(n => n.id === selectedNodeId)?.data?.title}
          </h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium text-gray-600 mb-1">
                Connected Systems ({connectedNodeIds.size}):
              </h4>
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

const queryClient = new QueryClient()

export function FlowDiagram() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactFlowProvider>
        <Flow />
      </ReactFlowProvider>
    </QueryClientProvider>
  )
}
