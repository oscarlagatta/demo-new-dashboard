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

/**
 * Expected JSON format for /lib/splunk-transaction-search-api.json:
 *
 * [
 *   {
 *     "id": "T0P7R96NFJWBBSTZ",
 *     "results": [
 *       {
 *         "source": "farm4_prod_db_GFD",
 *         "sourceType": "E2EUSWireGfdWtxTranInfo",
 *         "_raw": {
 *           "WTX_GFD_ID": "188452803",
 *           "SMH_SOURCE": "CPO",
 *           "SMH_DEST": "FED",
 *           "RQO_TRAN_DATE": "2025-07-14 00:00:00",
 *           "RQO_TRAN_TIME": "10:37:39",
 *           "RQO_TRAN_DATE_ALT": "2025-07-14 00:00:00",
 *           "RQO_TRAN_TIME_ALT": "06:37:39",
 *           "XQQ_CUST_CNTRY_CODE": "US",
 *           "AQQ_CUST_A_NUM": "413-375004275731",
 *           "AQQ_BILLING_CURR_CODE": "USD",
 *           "TBT_TRAN_TYPE": "IT",
 *           "TBT_REF_NUM": "2025071400315174",
 *           "TBT_BILLING_AMT": "8700.00",
 *           "TBT_MOD_AMT": "8700.00",
 *           "TBT_SCH_REF_NUM": "ENFORGE LLC GENERAL ACCOUNT",
 *           "TPP_CNTRY_CODE": "US",
 *           "TPP_BANK_CNTRY_CODE": "US",
 *           "TPP_CUST_A_NUM": "1853613741",
 *           "TPP_CURR_CODE": "USD",
 *           "TPP_TRAN_AMT": "8700.00",
 *           "DBA_ENTRY_METHOD": "M",
 *           "DBA_APPROVAL_TYPE_REQ": "S",
 *           "RUA_20BYTE_STRING_001": "T0P7R96NFJWBBSTZ",
 *           "RRR_ACTION_CODE": "A",
 *           "RRR_SCORE": "091",
 *           "BCC_CPS_CORRELATION": "T0P7R96NFJWBBSTZ",
 *           "REC_CRT_TS": "2025-07-14T06:37:44.771Z",
 *           "DBA_APPROVED_BY_USERID2": "USR10421"
 *         }
 *       }
 *     ]
 *   }
 * ]
 */

// Known 16-char transaction ID from the dataset
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

// DatasetEntry type used internally for the local dataset
type DatasetEntry = {
  id: string
  results: SplunkTransactionDetails
}

// Normalize any imported JSON into DatasetEntry[]
function normalizeDataset(raw: unknown): DatasetEntry[] {
  // Case 1: Already an array of entries
  if (Array.isArray(raw)) {
    return raw
      .map((item: any) => {
        if (item && typeof item === "object" && "id" in item && "results" in item && Array.isArray(item.results)) {
          return {
            id: String(item.id),
            results: item.results as SplunkTransactionDetails,
          } as DatasetEntry
        }
        return null
      })
      .filter(Boolean) as DatasetEntry[]
  }

  // Case 2: Object wrapper, e.g. { data: [...] }
  if (raw && typeof raw === "object") {
    const maybeData = (raw as any).data
    if (Array.isArray(maybeData)) {
      return normalizeDataset(maybeData)
    }

    // Case 3: Map-like object keyed by transaction ID
    const values = Object.values(raw as Record<string, unknown>)
    if (values.length > 0) {
      return normalizeDataset(values)
    }
  }

  console.warn("[use-transaction-search] Could not normalize dataset; got unexpected shape.")
  return []
}

// Ensure DATASET matches DatasetEntry[]
const DATASET: DatasetEntry[] = normalizeDataset(rawData as unknown)

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
  if (raw.REC_CRT_TS && !Number.isNaN(Date.parse(raw.REC_CRT_TS))) {
    return new Date(raw.REC_CRT_TS).toISOString()
  }
  const dateAlt = (raw.RQO_TRAN_DATE_ALT || "").trim()
  const timeAlt = (raw.RQO_TRAN_TIME_ALT || "").trim()
  const combined = `${dateAlt.split(" ")[0]}T${timeAlt}Z`
  if (!Number.isNaN(Date.parse(combined))) return new Date(combined).toISOString()

  const date = (raw.RQO_TRAN_DATE || "").trim().split(" ")[0]
  const time = (raw.RQO_TRAN_TIME || "").trim()
  const fallback = `${date}T${time}Z`
  return !Number.isNaN(Date.parse(fallback)) ? new Date(fallback).toISOString() : new Date().toISOString()
}

// Compute a normalized summary from the first result
function buildSummary(id: string, results: SplunkTransactionDetails): TransactionSummary {
  const first = results[0]?._raw as Raw | undefined
  const action = first?.RRR_ACTION_CODE
  const status = mapStatus(action)

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
