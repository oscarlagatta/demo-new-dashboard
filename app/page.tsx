"use client"

import { FlowDiagram } from "@/components/flow-diagram"
import PaymentSearchBox from "@/components/payment-search-box"
import { TransactionSearchProvider } from "@/components/transaction-search-provider"
import { QueryProvider } from "@/components/query-provider"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Settings, Home } from "lucide-react"

export default function HomePage() {
  return (
    <QueryProvider>
      <TransactionSearchProvider>
        <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
          {/* Navigation Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold text-gray-900">Payment Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="bg-blue-50 text-blue-600">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                  <Link href="/node-manager">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Node Manager
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Header section with search */}
          <div className="flex-shrink-0">
            <PaymentSearchBox />
          </div>

          {/* Main diagram section */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0">
            <div className="bg-white rounded-lg border shadow-sm h-full w-full">
              <FlowDiagram />
            </div>
          </main>
        </div>
      </TransactionSearchProvider>
    </QueryProvider>
  )
}
