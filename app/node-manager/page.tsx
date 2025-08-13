"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, ArrowLeft, Home, LinkIcon } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useFlowData,
  useCreateNode,
  useUpdateNode,
  useDeleteNode,
  useCreateEdge,
  useDeleteEdge,
} from "@/hooks/use-node-api"
import { NodeFormModal } from "@/components/node-form-modal"
import { ConnectionFormModal } from "@/components/connection-form-modal"
import { useToast } from "@/hooks/use-toast"

export default function NodeManagerPage() {
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false)
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState(null)
  const { toast } = useToast()

  const { data: flowData, isLoading, error } = useFlowData()
  const createNodeMutation = useCreateNode()
  const updateNodeMutation = useUpdateNode()
  const deleteNodeMutation = useDeleteNode()
  const createEdgeMutation = useCreateEdge()
  const deleteEdgeMutation = useDeleteEdge()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flow data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading flow data</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  const nodes = flowData?.nodes?.filter((node) => node.type !== "background") || []
  const edges = flowData?.edges || []
  const backgroundNodes = flowData?.nodes?.filter((node) => node.type === "background") || []

  const handleCreateNode = () => {
    setEditingNode(null)
    setIsNodeModalOpen(true)
  }

  const handleEditNode = (node) => {
    setEditingNode(node)
    setIsNodeModalOpen(true)
  }

  const handleSaveNode = async (nodeData) => {
    try {
      if (editingNode) {
        await updateNodeMutation.mutateAsync({ ...editingNode, ...nodeData })
        toast({ title: "Node updated successfully" })
      } else {
        const newNode = {
          id: `node-${Date.now()}`,
          ...nodeData,
        }
        await createNodeMutation.mutateAsync(newNode)
        toast({ title: "Node created successfully" })
      }
      setIsNodeModalOpen(false)
    } catch (error) {
      toast({ title: "Error saving node", variant: "destructive" })
    }
  }

  const handleDeleteNode = async (nodeId) => {
    try {
      await deleteNodeMutation.mutateAsync(nodeId)
      toast({ title: "Node deleted successfully" })
    } catch (error) {
      toast({ title: "Error deleting node", variant: "destructive" })
    }
  }

  const handleCreateConnection = async (connectionData) => {
    try {
      const newEdge = {
        id: `${connectionData.sourceId}-${connectionData.targetId}`,
        source: connectionData.sourceId,
        target: connectionData.targetId,
        type: connectionData.type,
      }
      await createEdgeMutation.mutateAsync(newEdge)
      toast({ title: "Connection created successfully" })
      setIsConnectionModalOpen(false)
    } catch (error) {
      toast({ title: "Error creating connection", variant: "destructive" })
    }
  }

  const handleDeleteConnection = async (edgeId) => {
    try {
      await deleteEdgeMutation.mutateAsync(edgeId)
      toast({ title: "Connection deleted successfully" })
    } catch (error) {
      toast({ title: "Error deleting connection", variant: "destructive" })
    }
  }

  const getNodeStatus = (node) => {
    if (node.class === "inactive") return "inactive"
    if (node.parentId) return "active"
    return node.class ? "active" : "inactive"
  }

  const activeNodes = nodes.filter((node) => getNodeStatus(node) === "active").length
  const inactiveNodes = nodes.filter((node) => getNodeStatus(node) === "inactive").length
  const totalConnections = edges.length

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case "origination":
        return "bg-blue-100 text-blue-800"
      case "payment validation and routing":
        return "bg-purple-100 text-purple-800"
      case "middleware":
        return "bg-orange-100 text-orange-800"
      case "payment processing, sanctions and investigation":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getNodeDisplayName = (node) => {
    return node.data?.label || node.title || node.label || `Node ${node.id}`
  }

  const getNodeConnections = (nodeId) => {
    return edges.filter(
      (edge) =>
        edge.source === nodeId ||
        edge.target === nodeId ||
        (Array.isArray(edge.target) && edge.target.includes(nodeId)),
    ).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900">Node Manager</h1>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Manage payment processing system nodes and their connections</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsConnectionModalOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Create Connection
            </Button>
            <Button onClick={handleCreateNode} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Node
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{activeNodes}</div>
              <div className="text-sm text-gray-600">Active Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{inactiveNodes}</div>
              <div className="text-sm text-gray-600">Inactive Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{totalConnections}</div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{backgroundNodes.length}</div>
              <div className="text-sm text-gray-600">Background Groups</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="nodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="nodes">Nodes ({nodes.length})</TabsTrigger>
            <TabsTrigger value="connections">Connections ({edges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nodes.map((node) => {
                const status = getNodeStatus(node)
                const connections = getNodeConnections(node.id)

                return (
                  <Card key={node.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{getNodeDisplayName(node)}</CardTitle>
                          <CardDescription className="text-sm text-gray-500">
                            {node.subtext || `ID: ${node.id}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNode(node)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNode(node.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getStatusColor(status)}>{status}</Badge>
                          {node.class && <Badge className={getClassificationColor(node.class)}>{node.class}</Badge>}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>Connections: {connections}</div>
                          {node.parentId && (
                            <div>
                              Parent: {backgroundNodes.find((bg) => bg.id === node.parentId)?.label || node.parentId}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="connections" className="space-y-4">
            <div className="grid gap-4">
              {edges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source)
                const targetNodes = Array.isArray(edge.target)
                  ? edge.target.map((id) => nodes.find((n) => n.id === id)).filter(Boolean)
                  : [nodes.find((n) => n.id === edge.target)].filter(Boolean)

                return (
                  <Card key={edge.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{getNodeDisplayName(sourceNode)}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">
                              {targetNodes.map((node) => getNodeDisplayName(node)).join(", ")}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Type: {edge.type || "default"} • ID: {edge.id}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConnection(edge.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        <NodeFormModal
          isOpen={isNodeModalOpen}
          onClose={() => setIsNodeModalOpen(false)}
          onSubmit={handleSaveNode}
          node={editingNode}
          backgroundNodes={backgroundNodes}
          isLoading={createNodeMutation.isPending || updateNodeMutation.isPending}
        />

        <ConnectionFormModal
          isOpen={isConnectionModalOpen}
          onClose={() => setIsConnectionModalOpen(false)}
          onSubmit={handleCreateConnection}
          nodes={nodes}
          existingEdges={edges}
          isLoading={createEdgeMutation.isPending}
        />
      </div>
    </div>
  )
}
