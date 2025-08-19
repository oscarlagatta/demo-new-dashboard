"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTransactionSearchContext } from "./transaction-search-provider"

export function TransactionDetailsTable() {
  const { results, selectedAitId, hideTable, id } = useTransactionSearchContext()

  // Pagination state for Shadcn table
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // Helper functions
  const formatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-400">—</span>
    }

    // Format dates
    if (columnName.includes("DATE") || columnName.includes("TS")) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString() + " " + date.toLocaleTimeString()
        }
      } catch (e) {
        // If date parsing fails, return original value
      }
    }

    // Format amounts
    if (columnName.includes("AMT") && !isNaN(Number.parseFloat(value))) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }).format(Number.parseFloat(value))
    }

    return String(value)
  }

  const getSystemName = (aitId: string) => {
    const SYSTEM_CODE_TO_AIT: Record<string, string> = {
      CPO: "11697",
      "CashPro Mobile": "41107",
      GPP: "28960",
      "Swift Gateway": "11554",
      B2Bi: "54071",
      "Swift Alliance": "512",
      GPO: "70199",
      "CashPro Payments": "28960",
      "FRP US": "15227",
      RPI: "60745",
      PSR: "31427",
      ECS: "834",
    }

    const systemCode = Object.entries(SYSTEM_CODE_TO_AIT).find(([_, id]) => id === aitId)?.[0]
    return systemCode || `AIT ${aitId}`
  }

  // Filter results for the selected AIT and get all available columns
  const { tableData, columns } = useMemo(() => {
    if (!results || !selectedAitId) return { tableData: [], columns: [] }

    // Find the AIT mapping to get the system code
    const SYSTEM_CODE_TO_AIT: Record<string, string> = {
      CPO: "11697",
      "CashPro Mobile": "41107",
      GPP: "28960",
      "Swift Gateway": "11554",
      B2Bi: "54071",
      "Swift Alliance": "512",
      GPO: "70199",
      "CashPro Payments": "28960",
      "FRP US": "15227",
      RPI: "60745",
      PSR: "31427",
      ECS: "834",
    }

    // Reverse lookup to find system codes for this AIT
    const systemCodes = Object.entries(SYSTEM_CODE_TO_AIT)
      .filter(([_, aitId]) => aitId === selectedAitId)
      .map(([code, _]) => code)

    // Filter results that match this AIT
    const relevantResults = results.filter((detail) => {
      const src = detail?._raw?.SMH_SOURCE
      const dst = detail?._raw?.SMH_DEST
      return systemCodes.includes(src || "") || systemCodes.includes(dst || "")
    })

    const allColumns = new Set<string>()
    relevantResults.forEach((detail) => {
      if (detail._raw) {
        Object.keys(detail._raw).forEach((key) => allColumns.add(key))
      }
    })

    const sortedColumns = Array.from(allColumns).sort()

    const tableData = relevantResults.map((detail, index) => {
      const rawData = detail._raw || {}
      const row: Record<string, any> = {
        id: `${rawData.WTX_GFD_ID || index}`,
        source: detail.source,
        sourceType: detail.sourceType,
      }

      // Add all _raw fields to the row
      sortedColumns.forEach((column) => {
        row[column] = rawData[column] || ""
      })

      return row
    })

    return { tableData, columns: sortedColumns }
  }, [results, selectedAitId])

  // Pagination calculations for Shadcn table
  const totalItems = tableData.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedData = tableData.slice(startIndex, endIndex)

  return (
    <TooltipProvider>
      <div className="h-full w-full bg-white">
        {/* Header */}
        <div className="border-b bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={hideTable}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Flow Chart</span>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Transaction Details</h1>
                <p className="text-sm text-gray-600">
                  {getSystemName(selectedAitId || "")} • Transaction ID: {id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shadcn Table Container with horizontal scroll */}
        <div className="w-full overflow-x-auto p-6">
          <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b bg-gray-50/50">
                  {columns.map((column) => {
                    const formattedName = formatColumnName(column)

                    return (
                      <TableHead key={column} className="font-medium text-gray-700 py-4 px-6 whitespace-nowrap">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="truncate cursor-help max-w-[150px] block">{formattedName}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formattedName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`border-b hover:bg-gray-50/50 ${index % 2 === 1 ? "bg-gray-50/30" : "bg-white"}`}
                  >
                    {columns.map((column) => {
                      return (
                        <TableCell key={column} className="py-4 px-6 whitespace-nowrap">
                          <div className="truncate max-w-[150px]">{formatCellValue(row[column], column)}</div>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Shadcn Table Pagination */}
        <div className="border-t bg-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {selectedRows.size} of {totalItems} row(s) selected.
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Rows per page</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-16 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 bg-transparent"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
