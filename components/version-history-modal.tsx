"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, User, RotateCcw, X, Edit3, Link, Tag, FolderTree, Type } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface NodePropertyChange {
  property: "label" | "title" | "subtext" | "classification" | "parentGroup" | "connections"
  oldValue: string | string[]
  newValue: string | string[]
  icon: React.ComponentType<{ className?: string }>
}

interface VersionHistoryEntry {
  id: string
  version: string
  timestamp: string
  author: string
  propertyChanges: NodePropertyChange[]
  status: "current" | "previous"
}

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  systemName: string
  systemId: string
  onRevert: (versionId: string) => Promise<void>
  isLoading?: boolean
}

const generateVersionHistory = (systemId: string): VersionHistoryEntry[] => [
  {
    id: `${systemId}-v3`,
    version: "3.2.1",
    timestamp: "2024-01-15T14:30:00Z",
    author: "John Smith",
    propertyChanges: [
      {
        property: "label",
        oldValue: "Payment Gateway v3.2.0",
        newValue: "Payment Gateway v3.2.1",
        icon: Type,
      },
      {
        property: "classification",
        oldValue: "Standard",
        newValue: "Critical",
        icon: Tag,
      },
    ],
    status: "current",
  },
  {
    id: `${systemId}-v2`,
    version: "3.2.0",
    timestamp: "2024-01-10T09:15:00Z",
    author: "Sarah Johnson",
    propertyChanges: [
      {
        property: "subtext",
        oldValue: "Handles credit card transactions",
        newValue: "Handles credit card and digital wallet transactions",
        icon: Edit3,
      },
      {
        property: "connections",
        oldValue: ["Database", "Auth Service"],
        newValue: ["Database", "Auth Service", "Fraud Detection"],
        icon: Link,
      },
    ],
    status: "previous",
  },
  {
    id: `${systemId}-v1`,
    version: "3.1.5",
    timestamp: "2024-01-05T16:45:00Z",
    author: "Mike Chen",
    propertyChanges: [
      {
        property: "parentGroup",
        oldValue: "Legacy Systems",
        newValue: "Core Services",
        icon: FolderTree,
      },
      {
        property: "title",
        oldValue: "Payment Processor",
        newValue: "Payment Gateway",
        icon: Type,
      },
    ],
    status: "previous",
  },
  {
    id: `${systemId}-v0`,
    version: "3.1.4",
    timestamp: "2023-12-28T11:20:00Z",
    author: "Lisa Rodriguez",
    propertyChanges: [
      {
        property: "label",
        oldValue: "New Payment System",
        newValue: "Payment Gateway v3.1.4",
        icon: Type,
      },
      {
        property: "classification",
        oldValue: "Development",
        newValue: "Standard",
        icon: Tag,
      },
    ],
    status: "previous",
  },
]

export function VersionHistoryModal({
  isOpen,
  onClose,
  systemName,
  systemId,
  onRevert,
  isLoading = false,
}: VersionHistoryModalProps) {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    versionId: "",
    version: "",
  })

  const versionHistory = generateVersionHistory(systemId)

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPropertyName = (property: string) => {
    const propertyNames: Record<string, string> = {
      label: "Label",
      title: "Title",
      subtext: "Description",
      classification: "Classification",
      parentGroup: "Parent Group",
      connections: "Connections",
    }
    return propertyNames[property] || property
  }

  const formatPropertyValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.join(", ")
    }
    return value
  }

  const handleRevertClick = (versionId: string, version: string) => {
    setConfirmDialog({
      isOpen: true,
      versionId,
      version,
    })
  }

  const handleConfirmRevert = async () => {
    try {
      await onRevert(confirmDialog.versionId)
      setConfirmDialog({ isOpen: false, versionId: "", version: "" })
      onClose()
    } catch (error) {
      // Error handling would be done by the parent component
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[85vh] bg-white border border-slate-200">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-700" />
                  Node Change History
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">{systemName}</DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 py-4">
              {versionHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    entry.status === "current"
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">Version {entry.version}</h3>
                        {entry.status === "current" && (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">Current</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700">Property Changes:</p>
                        <div className="space-y-3">
                          {entry.propertyChanges.map((change, changeIndex) => {
                            const IconComponent = change.icon
                            return (
                              <div key={changeIndex} className="bg-slate-50 border border-slate-200 rounded-md p-3">
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    <IconComponent className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-slate-900">
                                        {formatPropertyName(change.property)}
                                      </span>
                                      <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                                        Modified
                                      </Badge>
                                    </div>
                                    <div className="space-y-1">
                                      <div className="text-xs text-slate-500">From:</div>
                                      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 font-mono">
                                        {formatPropertyValue(change.oldValue)}
                                      </div>
                                      <div className="text-xs text-slate-500">To:</div>
                                      <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 font-mono">
                                        {formatPropertyValue(change.newValue)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {entry.status === "previous" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertClick(entry.id, entry.version)}
                        disabled={isLoading}
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center gap-2 flex-shrink-0"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Revert
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t border-slate-200 pt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 bg-transparent"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, versionId: "", version: "" })}
        onConfirm={handleConfirmRevert}
        title="Revert Node Properties"
        description={`Are you sure you want to revert "${systemName}" to version ${confirmDialog.version}? This action will:

• Restore all node properties (label, title, description, classification, etc.) to their previous values
• Update any connection changes made since this version
• Create a backup of the current node state before reverting
• Potentially affect related nodes and system integrations

This action can be undone by reverting to a newer version, but any unsaved changes will be lost.`}
        confirmText="Revert Node"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  )
}
