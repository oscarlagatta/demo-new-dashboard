"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, Save, X, ArrowLeft, Home } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

const mockNodes = [
  {
    id: "1",
    title: "Swift Gateway",
    subtext: "AIT 1",
    classification: "origination",
    status: "active",
    connections: 3,
    lastUpdated: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "GPO",
    subtext: "AIT 2",
    classification: "payment validation and routing",
    status: "active",
    connections: 5,
    lastUpdated: "2024-01-15T09:45:00Z",
  },
  {
    id: "3",
    title: "WTX",
    subtext: "AIT 3",
    classification: "middleware",
    status: "inactive",
    connections: 2,
    lastUpdated: "2024-01-14T16:20:00Z",
  },
  {
    id: "4",
    title: "RGBW",
    subtext: "AIT 4",
    classification: "payment processing, sanctions and investigation",
    status: "active",
    connections: 4,
    lastUpdated: "2024-01-15T11:15:00Z",
  },
  {
    id: "5",
    title: "Payment Hub",
    subtext: "AIT 5",
    classification: "origination",
    status: "maintenance",
    connections: 1,
    lastUpdated: "2024-01-13T14:30:00Z",
  },
]

const classifications = [
  "origination",
  "payment validation and routing",
  "middleware",
  "payment processing, sanctions and investigation",
]

const statuses = ["active", "inactive", "maintenance"]

export default function NodeManagerPage() {
  const [nodes, setNodes] = useState(mockNodes)
  const [editingNode, setEditingNode] = useState<(typeof mockNodes)[0] | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    subtext: "",
    classification: "",
    status: "active",
  })

  const handleCreateNode = () => {
    setEditingNode(null)
    setFormData({ title: "", subtext: "", classification: "", status: "active" })
    setIsDialogOpen(true)
  }

  const handleEditNode = (node: (typeof mockNodes)[0]) => {
    setEditingNode(node)
    setFormData({
      title: node.title,
      subtext: node.subtext,
      classification: node.classification,
      status: node.status,
    })
    setIsDialogOpen(true)
  }

  const handleSaveNode = () => {
    if (editingNode) {
      setNodes(
        nodes.map((node) =>
          node.id === editingNode.id ? { ...node, ...formData, lastUpdated: new Date().toISOString() } : node,
        ),
      )
    } else {
      const newNode = {
        id: (nodes.length + 1).toString(),
        ...formData,
        connections: 0,
        lastUpdated: new Date().toISOString(),
      }
      setNodes([...nodes, newNode])
    }
    setIsDialogOpen(false)
  }

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter((node) => node.id !== nodeId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getClassificationColor = (classification: string) => {
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
            <p className="text-gray-600">Manage payment processing system nodes and their configurations</p>
          </div>
          <Button onClick={handleCreateNode} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Node
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {nodes.filter((n) => n.status === "active").length}
              </div>
              <div className="text-sm text-gray-600">Active Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {nodes.filter((n) => n.status === "inactive").length}
              </div>
              <div className="text-sm text-gray-600">Inactive Nodes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {nodes.filter((n) => n.status === "maintenance").length}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{nodes.reduce((sum, n) => sum + n.connections, 0)}</div>
              <div className="text-sm text-gray-600">Total Connections</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map((node) => (
            <Card key={node.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{node.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-500">{node.subtext}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditNode(node)} className="h-8 w-8 p-0">
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
                    <Badge className={getStatusColor(node.status)}>{node.status}</Badge>
                    <Badge className={getClassificationColor(node.classification)}>{node.classification}</Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Connections: {node.connections}</div>
                    <div>Updated: {new Date(node.lastUpdated).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingNode ? "Edit Node" : "Create New Node"}</DialogTitle>
              <DialogDescription>
                {editingNode ? "Update the node configuration" : "Add a new node to the payment processing system"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter node title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtext">Subtext</Label>
                <Input
                  id="subtext"
                  value={formData.subtext}
                  onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                  placeholder="e.g., AIT 6"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="classification">Classification</Label>
                <Select
                  value={formData.classification}
                  onValueChange={(value) => setFormData({ ...formData, classification: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {classifications.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveNode}>
                <Save className="h-4 w-4 mr-2" />
                {editingNode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
