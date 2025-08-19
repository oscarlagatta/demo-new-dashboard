"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, ChevronRight, Globe, MapPin } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface FlowOption {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  jsonFile: string
}

interface FlowSidebarProps {
  selectedFlow: string
  onFlowChange: (flowId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

// Define available flow options - ADD NEW FLOWS HERE
const FLOW_OPTIONS: FlowOption[] = [
  {
    id: "us-wires",
    name: "US Wires",
    description: "US Wire Transfer Flow",
    icon: <Globe className="h-4 w-4" />,
    jsonFile: "api-data.json",
  },
  {
    id: "korea",
    name: "Korea",
    description: "Korea Payment Flow",
    icon: <MapPin className="h-4 w-4" />,
    jsonFile: "korea.json",
  },
]

export function FlowSidebar({ selectedFlow, onFlowChange, isCollapsed = false, onToggleCollapse }: FlowSidebarProps) {
  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && <h2 className="text-sm font-semibold text-gray-900">Flow Selection</h2>}
        {onToggleCollapse && (
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-8 w-8 p-0">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Flow Options */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {FLOW_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={selectedFlow === option.id ? "default" : "ghost"}
              className={cn("w-full justify-start gap-3 h-auto p-3", isCollapsed && "px-2 justify-center")}
              onClick={() => onFlowChange(option.id)}
            >
              {option.icon}
              {!isCollapsed && (
                <div className="flex flex-col items-start">
                  <span className="font-medium">{option.name}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </div>
              )}
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <>
          <Separator />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">Select a flow to view its payment processing diagram</p>
          </div>
        </>
      )}
    </div>
  )
}

// Export the flow options for use in other components
export { FLOW_OPTIONS }


/*
**Configuration-driven**: Add new flows by updating `FLOW_OPTIONS` array
**Collapsible Interface**: Space-saving collapsed state with icon-only view
**Visual Indicators**: Icons and descriptions for each flow type
**Responsive Design**: Adapts layout based on collapsed state
*/
