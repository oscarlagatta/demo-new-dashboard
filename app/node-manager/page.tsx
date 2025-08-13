"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trash2, Edit, Plus, ArrowLeft, Home, LinkIcon, Search, X } from "lucide-react"
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
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useToast } from "@/hooks/use-toast"

const getNodeDisplayName = (node) => {
  if (!node) return "Unknown Node"
  return node.data?.label || node.title || node.label || `Node ${node.id}`
}

export default function NodeManagerPage() {
  const { data: flowData, isLoading, error } = useFlowData()
  const createNodeMutation = useCreateNode()
  const updateNodeMutation = useUpdateNode()
  const deleteNodeMutation = useDeleteNode()
  const createEdgeMutation = useCreateEdge()
  const deleteEdgeMutation = useDeleteEdge()

  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false)
  const [isConnectionModalOpen, setIsConnectionModalOpen] = useState(false)
  const [editingNode, setEditingNode] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  })
  const { toast } = useToast()

  const nodes = useMemo(() => flowData?.nodes?.filter((node) => node.type !== "background") || [], [flowData])
  const edges = useMemo(() => flowData?.edges || [], [flowData])
  const backgroundNodes = useMemo(() => flowData?.nodes?.filter((node) => node.type === "background") || [], [flowData])

  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes

    const query = searchQuery.toLowerCase()
    return nodes.filter((node) => {
      const displayName = getNodeDisplayName(node).toLowerCase()
      const subtext = (node.subtext || "").toLowerCase()
      const nodeClass = (node.class || "").toLowerCase()
      const nodeId = node.id.toLowerCase()

      return (
        displayName.includes(query) || subtext.includes(query) || nodeClass.includes(query) || nodeId.includes(query)
      )
    })
  }, [nodes, searchQuery])

  const filteredEdges = useMemo(() => {
    if (!searchQuery.trim()) return edges

    const query = searchQuery.toLowerCase()
    return edges.filter((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source)
      const targetNodes = Array.isArray(edge.target)
        ? edge.target.map((id) => nodes.find((n) => n.id === id)).filter(Boolean)
        : [nodes.find((n) => n.id === edge.target)].filter(Boolean)

      const sourceName = getNodeDisplayName(sourceNode).toLowerCase()
      const targetNames = targetNodes.map((node) => getNodeDisplayName(node).toLowerCase()).join(" ")
      const edgeType = (edge.type || "").toLowerCase()
      const edgeId = edge.id.toLowerCase()

      return (
        sourceName.includes(query) || targetNames.includes(query) || edgeType.includes(query) || edgeId.includes(query)
      )
    })
  }, [edges, nodes, searchQuery])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading system data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-700 mb-4 font-medium">Error loading system data</p>
          <Button onClick={() => window.location.reload()} className="bg-slate-700 hover:bg-slate-800">
            Retry
          </Button>
        </div>
      </div>
    )
  }

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
    const node = nodes.find((n) => n.id === nodeId)
    const nodeName = getNodeDisplayName(node)

    setConfirmDialog({
      isOpen: true,
      title: "Delete Node",
      description: `Are you sure you want to delete "${nodeName}"? This action cannot be undone and will remove all associated connections.`,
      onConfirm: async () => {
        try {
          await deleteNodeMutation.mutateAsync(nodeId)
          toast({ title: "Node deleted successfully" })
        } catch (error) {
          toast({ title: "Error deleting node", variant: "destructive" })
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
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
    const edge = edges.find((e) => e.id === edgeId)
    const sourceNode = nodes.find((n) => n.id === edge?.source)
    const targetNodes = Array.isArray(edge?.target)
      ? edge.target.map((id) => nodes.find((n) => n.id === id)).filter(Boolean)
      : [nodes.find((n) => n.id === edge?.target)].filter(Boolean)

    const connectionDescription = `${getNodeDisplayName(sourceNode)} → ${targetNodes.map((node) => getNodeDisplayName(node)).join(", ")}`

    setConfirmDialog({
      isOpen: true,
      title: "Delete Connection",
      description: `Are you sure you want to delete the connection "${connectionDescription}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteEdgeMutation.mutateAsync(edgeId)
          toast({ title: "Connection deleted successfully" })
        } catch (error) {
          toast({ title: "Error deleting connection", variant: "destructive" })
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
    })
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
        return "bg-emerald-50 text-emerald-700 border border-emerald-200"
      case "inactive":
        return "bg-slate-100 text-slate-600 border border-slate-300"
      default:
        return "bg-gray-50 text-gray-600 border border-gray-300"
    }
  }

  const getClassificationColor = (classification) => {
    switch (classification) {
      case "origination":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "payment validation and routing":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200"
      case "middleware":
        return "bg-amber-50 text-amber-700 border border-amber-200"
      case "payment processing, sanctions and investigation":
        return "bg-violet-50 text-violet-700 border border-violet-200"
      default:
        return "bg-gray-50 text-gray-600 border border-gray-300"
    }
  }

  const getNodeConnections = (nodeId) => {
    return edges.filter(
      (edge) =>
        edge.source === nodeId ||
        edge.target === nodeId ||
        (Array.isArray(edge.target) && edge.target.includes(nodeId)),
    ).length
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sm:py-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 w-full sm:w-auto">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="hidden sm:block h-6 w-px bg-slate-300" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
              <span className="hidden md:inline">Node Management System</span>
              <span className="md:hidden">Node Manager</span>
            </h1>
          </div>
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-600 hover:bg-slate-50 bg-transparent w-full sm:w-auto"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="mb-6 lg:mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors duration-200" />
              <Input
                type="text"
                placeholder="Search nodes and connections by name, type, or classification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-3 text-base border-slate-300 bg-white shadow-sm hover:shadow-md focus:shadow-md focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all duration-200 placeholder:text-slate-400"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-slate-600 font-medium animate-in fade-in-0 duration-200">
                <span className="hidden sm:inline">
                  Found {filteredNodes.length} nodes and {filteredEdges.length} connections
                </span>
                <span className="sm:hidden">
                  {filteredNodes.length} nodes, {filteredEdges.length} connections
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-0 mb-6 lg:mb-8">
          <div className="w-full lg:w-auto">
            <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
              <span className="hidden sm:inline">Manage payment processing system nodes and their connections</span>
              <span className="sm:hidden">Manage nodes and connections</span>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Button
              onClick={() => setIsConnectionModalOpen(true)}
              variant="outline"
              className="flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Create Connection</span>
              <span className="sm:hidden">Connection</span>
            </Button>
            <Button
              onClick={handleCreateNode}
              className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create Node</span>
              <span className="sm:hidden">Node</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card className="border-slate-200 shadow-md">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-700">{activeNodes}</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                <span className="hidden sm:inline">Active Nodes</span>
                <span className="sm:hidden">Active</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-md">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-600">{inactiveNodes}</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                <span className="hidden sm:inline">Inactive Nodes</span>
                <span className="sm:hidden">Inactive</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-md">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-700">{totalConnections}</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                <span className="hidden sm:inline">Total Connections</span>
                <span className="sm:hidden">Connections</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200 shadow-md">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-indigo-700">{backgroundNodes.length}</div>
              <div className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                <span className="hidden sm:inline">Background Groups</span>
                <span className="sm:hidden">Groups</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="nodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200">
            <TabsTrigger
              value="nodes"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Nodes ({searchQuery ? filteredNodes.length : nodes.length})</span>
              <span className="sm:hidden">Nodes</span>
            </TabsTrigger>
            <TabsTrigger
              value="connections"
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">
                Connections ({searchQuery ? filteredEdges.length : edges.length})
              </span>
              <span className="sm:hidden">Connections</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {filteredNodes.map((node) => {
                const status = getNodeStatus(node)
                const connections = getNodeConnections(node.id)

                return (
                  <Card
                    key={node.id}
                    className="shadow-md hover:shadow-lg transition-all duration-200 border-slate-200 bg-white"
                  >
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                            {getNodeDisplayName(node)}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
                            {node.subtext || `ID: ${node.id}`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditNode(node)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNode(node.id)}
                            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`${getStatusColor(status)} text-xs`}>{status}</Badge>
                          {node.class && (
                            <Badge className={`${getClassificationColor(node.class)} text-xs truncate max-w-full`}>
                              {node.class}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 space-y-1">
                          <div className="font-medium">Connections: {connections}</div>
                          {node.parentId && (
                            <div className="text-slate-500 truncate">
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
            {searchQuery && filteredNodes.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No nodes found</h3>
                <p className="text-slate-500">Try adjusting your search terms or clear the search to see all nodes.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="connections" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredEdges.map((edge) => {
                const sourceNode = nodes.find((n) => n.id === edge.source)
                const targetNodes = Array.isArray(edge.target)
                  ? edge.target.map((id) => nodes.find((n) => n.id === id)).filter(Boolean)
                  : [nodes.find((n) => n.id === edge.target)].filter(Boolean)

                return (
                  <Card key={edge.id} className="shadow-md hover:shadow-lg transition-shadow border-slate-200 bg-white">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <span className="font-semibold text-slate-900 truncate">
                              {getNodeDisplayName(sourceNode)}
                            </span>
                            <span className="text-slate-400 self-start sm:self-center">→</span>
                            <span className="font-semibold text-slate-900 truncate">
                              {targetNodes.map((node) => getNodeDisplayName(node)).join(", ")}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-2 font-medium">
                            <div className="truncate">Type: {edge.type || "default"}</div>
                            <div className="truncate">ID: {edge.id}</div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteConnection(edge.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            {searchQuery && filteredEdges.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No connections found</h3>
                <p className="text-slate-500">
                  Try adjusting your search terms or clear the search to see all connections.
                </p>
              </div>
            )}
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

        <ConfirmationDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
          onConfirm={confirmDialog.onConfirm}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
        />
      </div>
    </div>
  )
}
