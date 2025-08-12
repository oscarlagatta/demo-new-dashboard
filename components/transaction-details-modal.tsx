"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

interface TransactionDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  aitId: string
  transactionData?: SplunkTransactionDetails
}

export function TransactionDetailsModal({ open, onOpenChange, aitId, transactionData }: TransactionDetailsModalProps) {
  // Filter records that match this AIT based on SMH_SOURCE/SMH_DEST
  const relevantRecords = useMemo(() => {
    if (!transactionData) return []

    // Map AIT ID back to system codes (reverse lookup)
    const aitToSystemCodes: Record<string, string[]> = {
      "11697": ["CPO"],
      "41107": ["CashPro Mobile"],
      "28960": ["GPP", "CashPro Payments"],
      "11554": ["Swift Gateway"],
      "54071": ["B2Bi"],
      "512": ["Swift Alliance"],
      "70199": ["GPO"],
      "15227": ["FRP US"],
      "60745": ["RPI"],
      "31427": ["PSR"],
      "834": ["ECS"],
    }

    const systemCodes = aitToSystemCodes[aitId] || []

    return transactionData.filter((record) => {
      const source = record._raw?.SMH_SOURCE
      const dest = record._raw?.SMH_DEST
      return systemCodes.includes(source || "") || systemCodes.includes(dest || "")
    })
  }, [transactionData, aitId])

  // Generate dynamic columns based on available data
  const columns = useMemo(() => {
    if (relevantRecords.length === 0) return []

    // Get all unique keys from all records
    const allKeys = new Set<string>()
    relevantRecords.forEach((record) => {
      if (record._raw) {
        Object.keys(record._raw).forEach((key) => allKeys.add(key))
      }
    })

    return Array.from(allKeys).sort()
  }, [relevantRecords])

  // Format field names for display
  const formatFieldName = (fieldName: string) => {
    return fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Format cell values for display
  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return "-"
    if (typeof value === "string" && value.trim() === "") return "-"
    return String(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Transaction Details - AIT {aitId}</DialogTitle>
          <DialogDescription>
            Detailed transaction data for records processed through this AIT node.
            {relevantRecords.length > 0 && ` Found ${relevantRecords.length} record(s).`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {relevantRecords.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No transaction data found for this AIT node.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  {columns.map((column) => (
                    <TableHead key={column} className="min-w-32">
                      {formatFieldName(column)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {relevantRecords.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    {columns.map((column) => (
                      <TableCell key={column} className="font-mono text-xs">
                        {formatCellValue(record._raw?.[column])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
