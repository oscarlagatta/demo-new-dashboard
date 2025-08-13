"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, User, RotateCcw, X } from "lucide-react"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface VersionHistoryEntry {
  id: string
  version: string
  timestamp: string
  author: string
  changes: string[]
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

// Mock version history data - in a real app, this would come from an API
const generateVersionHistory = (systemId: string): VersionHistoryEntry[] => [
  {
    id: `${systemId}-v3`,
    version: "3.2.1",
    timestamp: "2024-01-15T14:30:00Z",
    author: "John Smith",
    changes: ["Updated validation rules", "Enhanced error handling", "Performance optimizations"],
    status: "current",
  },
  {
    id: `${systemId}-v2`,
    version: "3.2.0",
    timestamp: "2024-01-10T09:15:00Z",
    author: "Sarah Johnson",
    changes: ["Added new payment methods", "Updated security protocols", "Bug fixes"],
    status: "previous",
  },
  {
    id: `${systemId}-v1`,
    version: "3.1.5",
    timestamp: "2024-01-05T16:45:00Z",
    author: "Mike Chen",
    changes: ["Database schema updates", "API endpoint modifications", "UI improvements"],
    status: "previous",
  },
  {
    id: `${systemId}-v0`,
    version: "3.1.4",
    timestamp: "2023-12-28T11:20:00Z",
    author: "Lisa Rodriguez",
    changes: ["Initial deployment", "Core functionality implementation"],
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
        <DialogContent className="max-w-2xl max-h-[80vh] bg-white border border-slate-200">
          <DialogHeader className="border-b border-slate-200 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-700" />
                  Version History
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

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">Changes:</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          {entry.changes.map((change, changeIndex) => (
                            <li key={changeIndex} className="flex items-start gap-2">
                              <span className="text-slate-400 mt-1">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
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
        title="Revert to Previous Version"
        description={`Are you sure you want to revert "${systemName}" to version ${confirmDialog.version}? This action will:

• Replace the current system configuration with the selected version
• Create a backup of the current version before reverting
• Potentially affect connected systems and data flows
• Require system restart and validation

This action can be undone by reverting to a newer version, but any unsaved changes will be lost.`}
        confirmText="Revert System"
        cancelText="Cancel"
        isDestructive={true}
      />
    </>
  )
}
