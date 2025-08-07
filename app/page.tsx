import { FlowDiagram } from "@/components/flow-diagram"
import PaymentSearchBox from "@/components/payment-search-box";


export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <PaymentSearchBox />
      <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0">
        <div className="bg-white rounded-lg border shadow-sm h-full w-full">
          <FlowDiagram />
        </div>
      </main>
    </div>
  )
}
