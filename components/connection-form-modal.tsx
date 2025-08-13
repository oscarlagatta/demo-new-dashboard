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
      <DialogContent className="sm:max-w-[500px] border-slate-200 shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900">Create New Connection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="sourceId" className="text-sm font-medium text-slate-700">
              Source Node
            </Label>
            <Select
              value={formData.sourceId}
              onValueChange={(value) => setFormData({ ...formData, sourceId: value, targetId: "" })}
            >
              <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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
            <Label htmlFor="targetId" className="text-sm font-medium text-slate-700">
              Target Node
            </Label>
            <Select
              value={formData.targetId}
              onValueChange={(value) => setFormData({ ...formData, targetId: value })}
              disabled={!formData.sourceId}
            >
              <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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
            <Label htmlFor="type" className="text-sm font-medium text-slate-700">
              Connection Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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
            <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-200">
              No available targets. All possible connections from this source already exist.
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.sourceId || !formData.targetId}
              className="bg-slate-700 hover:bg-slate-800"
            >
              {isLoading ? "Creating..." : "Create Connection"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
