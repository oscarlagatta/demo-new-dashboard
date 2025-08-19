"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FlowNode } from "@/hooks/use-node-api"

interface NodeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (nodeData: Partial<FlowNode>) => void
  node?: FlowNode | null
  backgroundNodes: FlowNode[]
  isLoading: boolean
}

export function NodeFormModal({ isOpen, onClose, onSubmit, node, backgroundNodes, isLoading }: NodeFormModalProps) {
  const [formData, setFormData] = useState({
    label: "",
    title: "",
    subtext: "",
    class: "origination",
    parentId: "none", // Updated default value to 'none'
  })

  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data?.label || node.label || "",
        title: node.title || "",
        subtext: node.subtext || "",
        class: node.class || "origination",
        parentId: node.parentId || "none", // Updated default value to 'none'
      })
    } else {
      setFormData({
        label: "",
        title: "",
        subtext: "",
        class: "origination",
        parentId: "none", // Updated default value to 'none'
      })
    }
  }, [node])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const nodeData: Partial<FlowNode> = {
      ...(formData.label && { data: { label: formData.label } }),
      ...(formData.title && { title: formData.title }),
      ...(formData.subtext && { subtext: formData.subtext }),
      class: formData.class,
      ...(formData.parentId !== "none" && { parentId: formData.parentId }), // Updated condition to exclude 'none'
    }

    onSubmit(nodeData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{node ? "Edit Node" : "Create New Node"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Swift Gateway"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title (Optional)</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., GPP (UI)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtext">Subtext (Optional)</Label>
            <Input
              id="subtext"
              value={formData.subtext}
              onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
              placeholder="e.g., Global PayPlus"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Classification</Label>
            <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="origination">Origination</SelectItem>
                <SelectItem value="payment validation and routing">Payment Validation & Routing</SelectItem>
                <SelectItem value="middleware">Middleware</SelectItem>
                <SelectItem value="payment processing, sanctions and investigation">
                  Payment Processing, Sanctions & Investigation
                </SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Group (Optional)</Label>
            <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {backgroundNodes.map((bg) => (
                  <SelectItem key={bg.id} value={bg.id}>
                    {bg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : node ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
