import { FlowDiagram } from "@/components/flow-diagram"
import PaymentSearchBox from "@/components/payment-search-box"
import { TransactionSearchProvider } from "@/components/transaction-search-provider"
import { QueryProvider } from "@/components/query-provider"

export default function Home() {
  return (
    <QueryProvider>
      <TransactionSearchProvider>
        <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
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
