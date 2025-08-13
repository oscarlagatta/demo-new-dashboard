"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Clock,
  User,
  RotateCcw,
  X,
  Edit3,
  Link,
  Tag,
  FolderTree,
  Type,
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
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

type SortField = "version" | "timestamp" | "author" | "changes"
type SortDirection = "asc" | "desc"

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
  {
    id: `${systemId}-v-1`,
    version: "3.1.3",
    timestamp: "2023-12-20T08:30:00Z",
    author: "David Wilson",
    propertyChanges: [
      {
        property: "connections",
        oldValue: ["Database"],
        newValue: ["Database", "Auth Service"],
        icon: Link,
      },
    ],
    status: "previous",
  },
  {
    id: `${systemId}-v-2`,
    version: "3.1.2",
    timestamp: "2023-12-15T13:45:00Z",
    author: "Emma Davis",
    propertyChanges: [
      {
        property: "title",
        oldValue: "Payment Handler",
        newValue: "Payment Processor",
        icon: Type,
      },
    ],
    status: "previous",
  },
  {
    id: `${systemId}-v-3`,
    version: "3.1.1",
    timestamp: "2023-12-10T10:15:00Z",
    author: "Alex Thompson",
    propertyChanges: [
      {
        property: "classification",
        oldValue: "Testing",
        newValue: "Development",
        icon: Tag,
      },
    ],
    status: "previous",
  },
  {
    id: `${systemId}-v-4`,
    version: "3.1.0",
    timestamp: "2023-12-05T16:20:00Z",
    author: "Rachel Green",
    propertyChanges: [
      {
        property: "label",
        oldValue: "Payment System Beta",
        newValue: "New Payment System",
        icon: Type,
      },
      {
        property: "parentGroup",
        oldValue: "Development",
        newValue: "Legacy Systems",
        icon: FolderTree,
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

  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("timestamp")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<"all" | "current" | "previous">("all")

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

  const filteredAndSortedData = useMemo(() => {
    const filtered = versionHistory.filter((entry) => {
      const matchesSearch =
        entry.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.propertyChanges.some((change) =>
          formatPropertyName(change.property).toLowerCase().includes(searchTerm.toLowerCase()),
        )

      const matchesStatus = statusFilter === "all" || entry.status === statusFilter

      return matchesSearch && matchesStatus
    })

    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "version":
          aValue = a.version
          bValue = b.version
          break
        case "timestamp":
          aValue = new Date(a.timestamp).getTime()
          bValue = new Date(b.timestamp).getTime()
          break
        case "author":
          aValue = a.author
          bValue = b.author
          break
        case "changes":
          aValue = a.propertyChanges.length
          bValue = b.propertyChanges.length
          break
        default:
          return 0
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [versionHistory, searchTerm, sortField, sortDirection, statusFilter])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const paginatedData = filteredAndSortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(Number.parseInt(newPageSize))
    setCurrentPage(1)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-slate-400" />
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    )
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
        <DialogContent className="max-w-6xl max-h-[90vh] bg-white border border-slate-200">
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

          <div className="flex flex-col sm:flex-row gap-4 py-4 border-b border-slate-200">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by version, author, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: "all" | "current" | "previous") => setStatusFilter(value)}
            >
              <SelectTrigger className="w-full sm:w-48 border-slate-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Versions</SelectItem>
                <SelectItem value="current">Current Only</SelectItem>
                <SelectItem value="previous">Previous Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow className="border-slate-200">
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("version")}
                    >
                      <div className="flex items-center gap-2">
                        Version
                        {getSortIcon("version")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("timestamp")}
                    >
                      <div className="flex items-center gap-2">
                        Date & Time
                        {getSortIcon("timestamp")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("author")}
                    >
                      <div className="flex items-center gap-2">
                        Author
                        {getSortIcon("author")}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-slate-100 transition-colors"
                      onClick={() => handleSort("changes")}
                    >
                      <div className="flex items-center gap-2">
                        Changes
                        {getSortIcon("changes")}
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={`border-slate-200 hover:bg-slate-50 transition-colors ${
                        entry.status === "current" ? "bg-blue-50" : ""
                      }`}
                    >
                      <TableCell className="font-medium text-slate-900">{entry.version}</TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(entry.timestamp)}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.author}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {entry.propertyChanges.map((change, changeIndex) => {
                            const IconComponent = change.icon
                            return (
                              <div key={changeIndex} className="flex items-center gap-2 text-sm">
                                <IconComponent className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <span className="text-slate-700 font-medium">
                                  {formatPropertyName(change.property)}
                                </span>
                                <div className="flex items-center gap-1 text-xs">
                                  <span className="text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-200 font-mono max-w-20 truncate">
                                    {formatPropertyValue(change.oldValue)}
                                  </span>
                                  <span className="text-slate-400">→</span>
                                  <span className="text-green-600 bg-green-50 px-1 py-0.5 rounded border border-green-200 font-mono max-w-20 truncate">
                                    {formatPropertyValue(change.newValue)}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.status === "current" ? (
                          <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-xs">Current</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs border-slate-300 text-slate-600">
                            Previous
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.status === "previous" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevertClick(entry.id, entry.version)}
                            disabled={isLoading}
                            className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center gap-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Revert
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                    <SelectTrigger className="w-20 h-8 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                  <span>records per page</span>
                </div>
                <div>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredAndSortedData.length)} to{" "}
                  {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length}{" "}
                  entries
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-600 mr-4">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-slate-300"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 border-slate-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-slate-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 border-slate-300"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

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
