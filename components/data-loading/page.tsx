"use client"

import { useState } from "react"
import { FlowDiagram } from "@/components/flow-diagram"
import { FlowSidebar, FLOW_OPTIONS } from "@/components/flow-sidebar"
import { Button } from "@/components/ui/button"
import { Settings, Home } from 'lucide-react'

export default function HomePage() {
  const [selectedFlow, setSelectedFlow] = useState("us-wires")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Get the selected flow option and corresponding JSON file
  const selectedFlowOption = FLOW_OPTIONS.find((option) => option.id === selectedFlow)
  const flowDataFile = selectedFlowOption?.jsonFile || "api-data.json"

  return (
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
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
          
          {/* Current flow indicator */}
          {selectedFlowOption && (
            <div className="text-sm text-gray-600">
              Current Flow: <span className="font-medium">{selectedFlowOption.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content with sidebar and diagram */}
      <div className="flex-grow flex">
        <FlowSidebar
          selectedFlow={selectedFlow}
          onFlowChange={setSelectedFlow}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main diagram section */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 pt-0">
          <div className="bg-white rounded-lg border shadow-sm h-full w-full">
            <FlowDiagram flowDataFile={flowDataFile} />
          </div>
        </main>
      </div>
    </div>
  )
}

/*
**State Management**: Manages selected flow and sidebar collapse state
**Data Flow**: Passes correct JSON file to diagram component
**Responsive Layout**: Handles sidebar collapse and main content sizing
**User Feedback**: Shows current selection in header
*/
