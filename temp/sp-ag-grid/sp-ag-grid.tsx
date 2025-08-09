"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import type { ColDef, GridApi, GridOptions, ICellRendererParams } from "ag-grid-community"
import { ArrowLeft, Columns, ListFilter } from 'lucide-react'

import { useGetSplunk, type SplunkDataItem } from "@/hooks/use-get-splunk"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-quartz.css"

import { ModuleRegistry } from "ag-grid-community"
import { ClientSideRowModelModule } from "ag-grid-community"
import { ColumnsToolPanelModule, MenuModule, SetFilterModule, SideBarModule } from "ag-grid-enterprise"

ModuleRegistry.registerModules([
ClientSideRowModelModule,
SetFilterModule,
ColumnsToolPanelModule,
SideBarModule,
MenuModule,
])

type ActionType = "flow" | "trend" | "balanced"

interface SplunkAgGridProps {
aitNum: string
action: ActionType
onBack: () => void
}

function formatNumber(value: string | number | null | undefined, decimals = 0) {
if (value === null || value === undefined) return ""
const num = typeof value === "string" ? Number.parseFloat(value) : value
if (Number.isNaN(num)) return ""
return num.toLocaleString(undefined, {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals,
})
}

function formatPercent(num: number, decimals = 2) {
const sign = num > 0 ? "+" : ""
return `${sign}${num.toFixed(decimals)}%`
}

function directionFormatter(direction: string) {
if (!direction) return ""
// Normalize casing like "INBOUND FROM" -> "Inbound From"
return direction
  .toLowerCase()
  .split(" ")
  .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
  .join(" ")
}

function Pill({ ok, neutral }: { ok?: boolean; neutral?: boolean }) {
const color = neutral ? "bg-gray-400" : ok ? "bg-green-600" : "bg-red-500"
return <span className={`inline-block h-2 w-2 rounded-full ${color}`} aria-hidden="true" />
}

function TrafficCellRenderer(props: ICellRendererParams) {
const v = props.value as "Yes" | "No" | null
if (v === "Yes") {
  return (
    <div className="flex items-center gap-2">
      <Pill ok />
      <span className="text-xs text-foreground">Yes</span>
    </div>
  )
}
if (v === "No") {
  return (
    <div className="flex items-center gap-2">
      <Pill />
      <span className="text-xs text-foreground">No</span>
    </div>
  )
}
return (
  <div className="flex items-center gap-2">
    <Pill neutral />
    <span className="text-xs text-muted-foreground">N/A</span>
  </div>
)
}

function OnTrendCellRenderer(props: ICellRendererParams) {
const txt = String(props.value ?? "")
const isOn = /on-trend/i.test(txt)
const isOff = /off-trend/i.test(txt)
if (isOn || isOff) {
  return (
    <div className="flex items-center gap-2">
      <Pill ok={isOn} />
      <span className={`text-xs ${isOn ? "text-foreground" : "text-foreground"}`}>{txt}</span>
    </div>
  )
}
return <span className="text-xs text-muted-foreground">{txt || "—"}</span>
}

function AnalyticsContextRenderer(props: ICellRendererParams) {
const txt = String(props.value ?? "")
return <span className="text-xs text-red-600">{txt}</span>
}

export default function SplunkAgGrid({ aitNum, action, onBack }: SplunkAgGridProps) {
const { data, isLoading, isError, refetch, isFetching } = useGetSplunk()
const [quickFilter, setQuickFilter] = useState("")
const [showColumnsPanel, setShowColumnsPanel] = useState(true)
const gridApiRef = useRef<GridApi | null>(null)

const rows = useMemo(() => {
  if (!data) return []
  return data.filter((r) => r.aiT_NUM === aitNum)
}, [data, aitNum])

const rowData = useMemo(() => {
  // Derive some columns: delta percentage and analytics context
  return rows.map((r) => {
    const avg = Number.parseFloat(r.averagE_TRANSACTION_COUNT)
    const curr = Number.parseFloat(r.currenT_TRANSACTION_COUNT)
    const deltaPct = Number.isFinite(avg) && avg !== 0 ? ((curr - avg) / avg) * 100 : 0
    const isOn = /on-trend/i.test(r.iS_TRAFFIC_ON_TREND || "")
    let analytics = ""
    if (!isOn && deltaPct < -10) {
      analytics = "Current Volume is Statistically Low"
    }
    return {
      ...r,
      _deltaPct: deltaPct,
      _balanced: isOn ? `On-Trend (${formatPercent(Math.abs(deltaPct))})` : r.iS_TRAFFIC_ON_TREND || "",
      _analytics: analytics,
      _normDirection: directionFormatter(r.floW_DIRECTION),
    }
  })
}, [rows])

const actionHighlightCols = useMemo(() => {
  if (action === "flow") return new Set(["iS_TRAFFIC_FLOWING", "currenT_TRANSACTION_COUNT"])
  if (action === "trend") return new Set(["iS_TRAFFIC_ON_TREND", "_deltaPct"])
  return new Set(["_balanced"])
}, [action])

const numberCellClass = "text-xs tabular-nums"
const emphasized = "bg-blue-50/60"

const columnDefs = useMemo<ColDef[]>(() => {
  const em = (field: string) => ({
    cellClass: (p: any) => (actionHighlightCols.has(field) ? `${numberCellClass} ${emphasized}` : numberCellClass),
    headerClass: actionHighlightCols.has(field) ? emphasized : "",
  })

  return [
    { headerName: "AIT Number", field: "aiT_NUM", pinned: "left", minWidth: 120, sortable: true, filter: true, cellClass: "text-xs font-medium" },
    { headerName: "AIT Name", field: "aiT_NAME", pinned: "left", minWidth: 160, sortable: true, filter: true, cellClass: "text-xs" },
    { headerName: "Flow Direction", field: "_normDirection", minWidth: 150, sortable: true, filter: true, cellClass: "text-xs" },
    { headerName: "Flow AIT Number", field: "floW_AIT_NUM", minWidth: 140, sortable: true, filter: true, cellClass: numberCellClass, valueFormatter: (p) => formatNumber(p.value) },
    { headerName: "Flow AIT Name", field: "floW_AIT_NAME", minWidth: 160, sortable: true, filter: true, cellClass: "text-xs" },
    { headerName: "Is Traffic Flowing", field: "iS_TRAFFIC_FLOWING", minWidth: 150, sortable: true, filter: true, cellRenderer: TrafficCellRenderer, headerClass: actionHighlightCols.has("iS_TRAFFIC_FLOWING") ? emphasized : "" },
    { headerName: "Is Traffic On Trend", field: "iS_TRAFFIC_ON_TREND", minWidth: 170, sortable: true, filter: true, cellRenderer: OnTrendCellRenderer, headerClass: actionHighlightCols.has("iS_TRAFFIC_ON_TREND") ? emphasized : "" },
    { headerName: "Current Std Variation", field: "currenT_STD_VARIATION", minWidth: 170, sortable: true, filter: true, ...em("currenT_STD_VARIATION"), valueFormatter: (p) => formatNumber(p.value, 2) },
    { headerName: "Historic Mean", field: "historiC_MEAN", minWidth: 140, sortable: true, filter: true, ...em("historiC_MEAN"), valueFormatter: (p) => formatNumber(p.value, 2) },
    { headerName: "Historic Std Dev", field: "historiC_STD", minWidth: 160, sortable: true, filter: true, ...em("historiC_STD"), valueFormatter: (p) => formatNumber(p.value, 2) },
    { headerName: "Current Transaction Count", field: "currenT_TRANSACTION_COUNT", minWidth: 200, sortable: true, filter: true, ...em("currenT_TRANSACTION_COUNT"), valueFormatter: (p) => formatNumber(p.value) },
    { headerName: "Average Transaction Count", field: "averagE_TRANSACTION_COUNT", minWidth: 200, sortable: true, filter: true, ...em("averagE_TRANSACTION_COUNT"), valueFormatter: (p) => formatNumber(p.value) },
    { headerName: "Average Transaction Delta", field: "_deltaPct", minWidth: 190, sortable: true, filter: true, ...em("_deltaPct"), valueFormatter: (p) => formatPercent(p.value) },
    { headerName: "Balanced", field: "_balanced", minWidth: 150, sortable: true, filter: true, headerClass: actionHighlightCols.has("_balanced") ? emphasized : "", cellClass: "text-xs" },
    { headerName: "Analytics Context", field: "_analytics", minWidth: 220, sortable: true, filter: true, cellRenderer: AnalyticsContextRenderer },
  ]
}, [actionHighlightCols])

const defaultColDef = useMemo<ColDef>(
  () => ({
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
  }),
  [],
)

const gridOptions = useMemo<GridOptions>(() => {
  return {
    sideBar: {
      toolPanels: [
        {
          id: "columns",
          labelDefault: "Columns",
          labelKey: "columns",
          iconKey: "columns",
          toolPanel: "agColumnsToolPanel",
        },
      ],
      defaultToolPanel: showColumnsPanel ? "columns" : undefined,
    },
    rowHeight: 36,
    headerHeight: 38,
    animateRows: true,
    suppressDragLeaveHidesColumns: true,
    ensureDomOrder: true,
    suppressColumnMoveAnimation: true,
    enableCellTextSelection: true,
    suppressAggFuncInHeader: true,
    // No expand functionality required
    groupDisplayType: "singleColumn",
    rowGroupPanelShow: "never",
    pivotPanelShow: "never",
    suppressRowGroupHidesColumns: true,
  }
}, [showColumnsPanel])

useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") onBack()
  }
  window.addEventListener("keydown", onKey)
  return () => window.removeEventListener("keydown", onKey)
}, [onBack])

const onGridReady = (params: any) => {
  gridApiRef.current = params.api
  params.api.setGridOption("quickFilterText", quickFilter)
  // Fit columns after initial render
  setTimeout(() => {
    try {
      params.api.sizeColumnsToFit()
    } catch {}
  }, 0)
}

const onGridSizeChanged = () => {
  gridApiRef.current?.sizeColumnsToFit()
}

useEffect(() => {
  gridApiRef.current?.setGridOption("quickFilterText", quickFilter)
}, [quickFilter])

return (
  <div className="flex h-full w-full flex-col">
    <Card className="border-0 border-b rounded-none">
      <CardHeader className="py-3 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack} aria-label="Back to Flow Graph">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Graph
            </Button>
            <CardTitle className="text-sm">
              AIT {aitNum} — {action === "flow" ? "Flow" : action === "trend" ? "Trend" : "Balanced"} View
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Columns className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowColumnsPanel((s) => !s)}
                className="text-xs"
              >
                {showColumnsPanel ? "Hide Columns Panel" : "Show Columns Panel"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <ListFilter className="h-4 w-4 text-muted-foreground" />
              <Input
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
                placeholder="Quick filter..."
                className="h-8 w-[200px]"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>

    <div className="flex-1 ag-theme-quartz">
      {isLoading ? (
        <div className="p-4 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : isError ? (
        <div className="p-6">
          <p className="text-sm text-red-600">Failed to load data. Please try refreshing.</p>
        </div>
      ) : rowData.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-muted-foreground">No rows found for AIT {aitNum}.</p>
        </div>
      ) : (
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
          onGridReady={onGridReady}
          onGridSizeChanged={onGridSizeChanged}
          suppressRowClickSelection
          suppressCellFocus
          tooltipShowDelay={300}
          tooltipMouseTrack
          pagination
          paginationPageSize={25}
          paginationAutoPageSize={false}
        />
      )}
    </div>
  </div>
)
}
