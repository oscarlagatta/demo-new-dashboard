"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type {
  TransactionApiResponse,
  SplunkTransactionDetails,
  TransactionSummary,
  Raw,
} from "@/types/splunk-transaction"
import rawData from "@/lib/splunk-transaction-search-api.json"

const KNOWN_ID = "T0P7R96NFJWBBSTZ"
const ID_REGEX = /^[A-Z0-9]{16}$/

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

// The JSON file only includes { id, results }, so define the dataset entry accordingly.
type DatasetEntry = {
  id: string
  results: SplunkTransactionDetails
}

const DATASET = rawData as DatasetEntry[]

// Map Splunk action code to normalized status
function mapStatus(code?: string): TransactionSummary["status"] {
  switch ((code || "").toUpperCase()) {
    case "A":
      return "Approved"
    case "R":
      return "Rejected"
    case "P":
      return "Pending"
    default:
      return "Pending"
  }
}

// Safely parse number from string
function toNumber(value?: string): number {
  const n = Number.parseFloat((value || "").replace(/,/g, ""))
  return Number.isFinite(n) ? n : 0
}

// Build ISO datetime string from Splunk fields
function toIsoDate(raw: Raw): string {
  // Prefer REC_CRT_TS if it looks like ISO
  if (raw.REC_CRT_TS && !Number.isNaN(Date.parse(raw.REC_CRT_TS))) {
    return new Date(raw.REC_CRT_TS).toISOString()
  }
  // Fallback to RQO_TRAN_DATE_ALT + RQO_TRAN_TIME_ALT if available
  const dateAlt = (raw.RQO_TRAN_DATE_ALT || "").trim()
  const timeAlt = (raw.RQO_TRAN_TIME_ALT || "").trim()
  const combined = `${dateAlt.split(" ")[0]}T${timeAlt}Z`
  if (!Number.isNaN(Date.parse(combined))) return new Date(combined).toISOString()

  // Last resort: try RQO_TRAN_DATE + RQO_TRAN_TIME
  const date = (raw.RQO_TRAN_DATE || "").trim().split(" ")[0]
  const time = (raw.RQO_TRAN_TIME || "").trim()
  const fallback = `${date}T${time}Z`
  return !Number.isNaN(Date.parse(fallback)) ? new Date(fallback).toISOString() : new Date().toISOString()
}

// Compute a normalized summary from the first result (typical for single-ID searches)
function buildSummary(id: string, results: SplunkTransactionDetails): TransactionSummary {
  const first = results[0]?._raw as Raw | undefined
  const action = first?.RRR_ACTION_CODE
  const status = mapStatus(action)

  // Prefer billing currency and amount; fallback to payment fields
  const currency = first?.AQQ_BILLING_CURR_CODE || first?.TPP_CURR_CODE || "USD"
  const amount = toNumber(first?.TBT_BILLING_AMT || first?.TPP_TRAN_AMT)

  const date = first ? toIsoDate(first) : new Date().toISOString()
  const reference = first?.TBT_REF_NUM || id
  const source = first?.SMH_SOURCE || "Unknown"
  const counterpartyCountry = first?.TPP_CNTRY_CODE || first?.TPP_BANK_CNTRY_CODE || first?.XQQ_CUST_CNTRY_CODE || "US"
  const score = first?.RRR_SCORE ? Number.parseInt(first.RRR_SCORE, 10) : undefined

  const metadata: Record<string, string | number | boolean> = {
    destination: first?.SMH_DEST || "",
    entryMethod: first?.DBA_ENTRY_METHOD || "",
    approvalType: first?.DBA_APPROVAL_TYPE_REQ || "",
    transactionType: first?.TBT_TRAN_TYPE || "",
    scheduleRef: first?.TBT_SCH_REF_NUM || "",
    approvedBy: first?.DBA_APPROVED_BY_USERID2 || "",
    correlationId: first?.BCC_CPS_CORRELATION || "",
    customerAccount: first?.AQQ_CUST_A_NUM || "",
  }

  return {
    id,
    status,
    amount,
    currency,
    date,
    reference,
    source,
    counterpartyCountry,
    score,
    metadata,
  }
}

// Simulate a local "fetch" with small latency; shape must match TransactionApiResponse
async function fetchTransactionLocal(id: string): Promise<TransactionApiResponse> {
  const normalized = id.trim().toUpperCase()

  // small artificial delay to maintain existing UX
  await new Promise((r) => setTimeout(r, 250))

  const match = DATASET.find((entry) => entry.id.toUpperCase() === normalized)
  if (!match) {
    throw new ApiError("Transaction not found", 404)
  }

  const summary = buildSummary(match.id, match.results)

  // Return a deep-copied, shape-compliant object
  return JSON.parse(
    JSON.stringify({
      id: match.id,
      results: match.results,
      summary,
    } satisfies TransactionApiResponse),
  )
}

/**
 * useTransactionSearch
 * - Reads from local JSON dataset and returns TransactionApiResponse (with summary).
 */
export function useTransactionSearch(defaultId: string = KNOWN_ID) {
  const [queryId, setQueryId] = useState<string>(defaultId.toUpperCase())

  const enabled = useMemo(() => ID_REGEX.test(queryId), [queryId])

  const query = useQuery<TransactionApiResponse, ApiError>({
    queryKey: ["transaction", queryId],
    queryFn: () => fetchTransactionLocal(queryId),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error?.status === 400 || error?.status === 404) return false
      return failureCount < 2
    },
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  })

  const invalidId = useMemo(() => !ID_REGEX.test(queryId) || query.error?.status === 400, [queryId, query.error])
  const notFound = useMemo(() => query.error?.status === 404, [query.error])

  function search(nextId: string) {
    setQueryId(nextId.toUpperCase())
  }

  function reset() {
    setQueryId(defaultId.toUpperCase())
  }

  const results: SplunkTransactionDetails | undefined = query.data?.results
  const summary: TransactionSummary | undefined = query.data?.summary

  return {
    id: queryId,
    results,
    summary,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    invalidId,
    notFound,
    refetch: query.refetch,
    search,
    reset,
  }
}
