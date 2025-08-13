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
      <DialogContent className="sm:max-w-[500px] border-slate-200 shadow-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold text-slate-900">
            {node ? "Edit Node" : "Create New Node"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-sm font-medium text-slate-700">
              Label
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Swift Gateway"
              className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-slate-700">
              Title (Optional)
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., GPP (UI)"
              className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtext" className="text-sm font-medium text-slate-700">
              Subtext (Optional)
            </Label>
            <Input
              id="subtext"
              value={formData.subtext}
              onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
              placeholder="e.g., Global PayPlus"
              className="border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class" className="text-sm font-medium text-slate-700">
              Classification
            </Label>
            <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
              <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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
            <Label htmlFor="parentId" className="text-sm font-medium text-slate-700">
              Parent Group (Optional)
            </Label>
            <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
              <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500">
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

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-slate-700 hover:bg-slate-800">
              {isLoading ? "Saving..." : node ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
