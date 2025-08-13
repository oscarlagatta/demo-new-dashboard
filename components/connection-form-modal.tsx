"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FlowNode, FlowEdge } from "@/hooks/use-node-api"

interface ConnectionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (connectionData: { sourceId: string; targetId: string; type?: string }) => void
  nodes: FlowNode[]
  existingEdges: FlowEdge[]
  isLoading: boolean
}

export function ConnectionFormModal({
  isOpen,
  onClose,
  onSubmit,
  nodes,
  existingEdges,
  isLoading,
}: ConnectionFormModalProps) {
  const [formData, setFormData] = useState({
    sourceId: "",
    targetId: "",
    type: "step",
  })

  const getNodeDisplayName = (node: FlowNode) => {
    return node.data?.label || node.title || node.label || `Node ${node.id}`
  }

  const isConnectionExists = (sourceId: string, targetId: string) => {
    return existingEdges.some(
      (edge) =>
        edge.source === sourceId &&
        (edge.target === targetId || (Array.isArray(edge.target) && edge.target.includes(targetId))),
    )
  }

  const availableTargets = nodes.filter(
    (node) => node.id !== formData.sourceId && !isConnectionExists(formData.sourceId, node.id),
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.sourceId || !formData.targetId) return

    onSubmit({
      sourceId: formData.sourceId,
      targetId: formData.targetId,
      type: formData.type,
    })

    setFormData({ sourceId: "", targetId: "", type: "step" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Connection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceId">Source Node</Label>
            <Select
              value={formData.sourceId}
              onValueChange={(value) => setFormData({ ...formData, sourceId: value, targetId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source node" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {getNodeDisplayName(node)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetId">Target Node</Label>
            <Select
              value={formData.targetId}
              onValueChange={(value) => setFormData({ ...formData, targetId: value })}
              disabled={!formData.sourceId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target node" />
              </SelectTrigger>
              <SelectContent>
                {availableTargets.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {getNodeDisplayName(node)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Connection Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="step">Step</SelectItem>
                <SelectItem value="flow">Flow</SelectItem>
                <SelectItem value="data">Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.sourceId && availableTargets.length === 0 && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              No available targets. All possible connections from this source already exist.
            </p>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.sourceId || !formData.targetId}>
              {isLoading ? "Creating..." : "Create Connection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
