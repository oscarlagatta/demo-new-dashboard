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
}

const TransactionSearchContext = createContext<TransactionSearchContextValue | null>(null)

// Use an invalid default to keep the query disabled until user searches
const INVALID_DEFAULT = "INVALID_ID_0000"

export function TransactionSearchProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false)

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
    tx.reset() // resets to INVALID_DEFAULT, disabling the query
  }, [tx])

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
    }
  }, [active, tx, search, clear])

  return <TransactionSearchContext.Provider value={value}>{children}</TransactionSearchContext.Provider>
}

export function useTransactionSearchContext() {
  const ctx = useContext(TransactionSearchContext)
  if (!ctx) {
    throw new Error("useTransactionSearchContext must be used within TransactionSearchProvider")
  }
  return ctx
}
