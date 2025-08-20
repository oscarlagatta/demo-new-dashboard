"use client"

import { useState } from "react"
import { FlowDiagram } from "@payment-org/flow-visualization"
import { NavigationSidebar, FLOW_OPTIONS, NAVIGATION_OPTIONS } from "@payment-org/shared-ui"
import { PaymentSearchBox } from "@payment-org/transaction-management"
import { TransactionSearchProvider } from "@payment-org/transaction-management"
import { Button } from "@payment-org/shared-ui"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@payment-org/shared-ui"
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"

function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Dashboard Overview</h2>
        <p className="text-gray-600">Monitor payment flows and system performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button>View US Wires Flow</Button>
          <Button variant="outline">View Korea Flow</Button>
          <Button variant="outline">Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function PageContent({ pageId }: { pageId: string }) {
  const page = NAVIGATION_OPTIONS.find((p) => p.id === pageId)

  return (
    <div className="p-6 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mb-4">
          {page?.icon && (
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">{page.icon}</div>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{page?.name}</h2>
        <p className="text-gray-600">{page?.description}</p>
        <p className="text-sm text-gray-500 mt-4">This page is under development</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [selectedFlow, setSelectedFlow] = useState<string>()
  const [selectedPage, setSelectedPage] = useState("dashboard")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const selectedFlowOption = FLOW_OPTIONS.find((option) => option.id === selectedFlow)
  const flowDataFile = selectedFlowOption?.jsonFile

  const handlePageChange = (pageId: string) => {
    setSelectedPage(pageId)
    setSelectedFlow(undefined)
  }

  const handleFlowChange = (flowId: string) => {
    setSelectedFlow(flowId)
    setSelectedPage("")
  }

  const isShowingFlow = selectedFlow && flowDataFile
  const currentPageTitle = isShowingFlow
    ? `${selectedFlowOption?.name} Flow`
    : NAVIGATION_OPTIONS.find((p) => p.id === selectedPage)?.name || "Dashboard"

  return (
    <TransactionSearchProvider>
      <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Navigation Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Payment Dashboard</h1>
              <div className="text-sm text-gray-600">
                Current: <span className="font-medium">{currentPageTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {isShowingFlow && (
          <div className="flex-shrink-0">
            <PaymentSearchBox />
          </div>
        )}

        {/* Main content with sidebar */}
        <div className="flex-grow flex">
          <NavigationSidebar
            selectedFlow={selectedFlow}
            selectedPage={selectedPage}
            onFlowChange={handleFlowChange}
            onPageChange={handlePageChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Main content section */}
          <main className="flex-grow">
            {isShowingFlow ? (
              <div className="p-4 sm:p-6 lg:p-8 pt-4 h-full">
                <div className="bg-white rounded-lg border shadow-sm h-full w-full">
                  <FlowDiagram flowDataFile={flowDataFile} />
                </div>
              </div>
            ) : selectedPage === "dashboard" ? (
              <div className="bg-white h-full overflow-auto">
                <DashboardContent />
              </div>
            ) : (
              <div className="bg-white h-full">
                <PageContent pageId={selectedPage} />
              </div>
            )}
          </main>
        </div>
      </div>
    </TransactionSearchProvider>
  )
}
