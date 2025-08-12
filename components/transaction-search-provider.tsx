"use client"

import type React from "react"
import { createContext, useContext, useMemo, useState, useCallback } from "react"
import { useTransactionSearch } from "@/hooks/use-transaction-search"
import type { SplunkTransactionDetails } from "@/types/splunk-transaction"

type TransactionSearchContextValue = {
  active: boolean
  id: string
  results?: SplunkTransactionDetails
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  error?: Error
  invalidId: boolean
  notFound: boolean
  search: (id: string) => void
  clear: () => void
  // New: the set of AIT IDs that have data for the active transaction
  matchedAitIds: Set<string>
  showTableView: boolean
  selectedAitId: string | null
  showTable: (aitId: string) => void
  hideTable: () => void
}

const TransactionSearchContext = createContext<TransactionSearchContextValue | null>(null)

// Use an invalid default to keep the query disabled until user searches
const INVALID_DEFAULT = "INVALID_ID_0000"

/**
 * Map system codes/names (from _raw.SMH_SOURCE/_raw.SMH_DEST) to AIT IDs present in the diagram.
 * Update this mapping as needed to reflect your environment.
 */
const SYSTEM_CODE_TO_AIT: Record<string, string> = {
  // Sources commonly present in your dataset
  CPO: "11697", // "CPO API Gateway"
  "CashPro Mobile": "41107",
  GPP: "28960", // Approximate mapping to "CashPro Payments" (Global PayPlus)
  "Swift Gateway": "11554",
  B2Bi: "54071",
  "Swift Alliance": "512",
  GPO: "70199",
  "CashPro Payments": "28960",
  "FRP US": "15227",
  RPI: "60745",
  PSR: "31427",
  ECS: "834",
  // Destinations like FED/RTP/SEPA/ACH/FPS/ZENGIN typically don’t map to AIT nodes; omit unless you add nodes.
}

export function TransactionSearchProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)
  const [showTableView, setShowTableView] = useState(false)
  const [selectedAitId, setSelectedAitId] = useState<string | null>(null)

  // Initialize hook with invalid default so it doesn't run until a valid search
  const tx = useTransactionSearch(INVALID_DEFAULT)

  const search = useCallback(
    (id: string) => {
      if (!id) return
      setActive(true)
      tx.search(id)
    },
    [tx],
  )

  const clear = useCallback(() => {
    setActive(false)
    setShowTableView(false)
    setSelectedAitId(null)
    tx.reset() // resets to INVALID_DEFAULT, disabling the query
  }, [tx])

  const showTable = useCallback((aitId: string) => {
    setSelectedAitId(aitId)
    setShowTableView(true)
  }, [])

  const hideTable = useCallback(() => {
    setShowTableView(false)
    setSelectedAitId(null)
  }, [])

  // Derive which AIT IDs are relevant to the current transaction search results
  const matchedAitIds = useMemo(() => {
    const set = new Set<string>()
    if (!active || !tx.results?.length) return set

    for (const detail of tx.results) {
      const src = detail?._raw?.SMH_SOURCE
      const dst = detail?._raw?.SMH_DEST
      if (src && SYSTEM_CODE_TO_AIT[src]) set.add(SYSTEM_CODE_TO_AIT[src])
      if (dst && SYSTEM_CODE_TO_AIT[dst]) set.add(SYSTEM_CODE_TO_AIT[dst])
    }
    return set
  }, [active, tx.results])

  const value = useMemo<TransactionSearchContextValue>(() => {
    return {
      active,
      id: tx.id,
      results: tx.results,
      isLoading: tx.isLoading,
      isFetching: tx.isFetching,
      isError: tx.isError,
      error: tx.error,
      invalidId: tx.invalidId,
      notFound: tx.notFound,
      search,
      clear,
      matchedAitIds,
      showTableView,
      selectedAitId,
      showTable,
      hideTable,
    }
  }, [active, tx, search, clear, matchedAitIds, showTableView, selectedAitId, showTable, hideTable])

  return <TransactionSearchContext.Provider value={value}>{children}</TransactionSearchContext.Provider>
}

export function useTransactionSearchContext() {
  const ctx = useContext(TransactionSearchContext)
  if (!ctx) {
    throw new Error("useTransactionSearchContext must be used within TransactionSearchProvider")
  }
  return ctx
}
