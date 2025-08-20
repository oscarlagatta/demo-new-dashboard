"use client"

import type React from "react"
import { Button } from "@payment-org/shared-ui"
import { ScrollArea } from "@payment-org/shared-ui"
import { Separator } from "@payment-org/shared-ui"
import { ChevronLeft, ChevronRight, Globe, MapPin, Home, BarChart3, Settings, Users, FileText } from "lucide-react"
import { cn } from "@payment-org/shared-ui/lib/utils"

export interface FlowOption {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  jsonFile: string
}

export interface NavigationOption {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  href?: string
}

interface NavigationSidebarProps {
  selectedFlow?: string
  selectedPage?: string
  onFlowChange?: (flowId: string) => void
  onPageChange?: (pageId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const NAVIGATION_OPTIONS: NavigationOption[] = [
  {
    id: "dashboard",
    name: "Home Dashboard",
    description: "Overview and analytics",
    icon: <Home className="h-4 w-4" />,
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Payment insights and reports",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    id: "users",
    name: "User Management",
    description: "Manage system users",
    icon: <Users className="h-4 w-4" />,
  },
  {
    id: "reports",
    name: "Reports",
    description: "Generate and view reports",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: "settings",
    name: "Settings",
    description: "System configuration",
    icon: <Settings className="h-4 w-4" />,
  },
]

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

export function NavigationSidebar({
  selectedFlow,
  selectedPage = "dashboard",
  onFlowChange,
  onPageChange,
  isCollapsed = false,
  onToggleCollapse,
}: NavigationSidebarProps) {
  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && <h2 className="text-sm font-semibold text-gray-900">Navigation</h2>}
        {onToggleCollapse && (
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="h-8 w-8 p-0">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {!isCollapsed && (
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Main Pages</h3>
          )}
          <div className="space-y-1">
            {NAVIGATION_OPTIONS.map((option) => (
              <Button
                key={option.id}
                variant={selectedPage === option.id ? "default" : "ghost"}
                className={cn("w-full justify-start gap-3 h-auto p-3", isCollapsed && "px-2 justify-center")}
                onClick={() => onPageChange?.(option.id)}
              >
                {option.icon}
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{option.name}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-2" />

        <div className="p-2">
          {!isCollapsed && (
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">Flow Diagrams</h3>
          )}
          <div className="space-y-1">
            {FLOW_OPTIONS.map((option) => (
              <Button
                key={option.id}
                variant={selectedFlow === option.id ? "default" : "ghost"}
                className={cn("w-full justify-start gap-3 h-auto p-3", isCollapsed && "px-2 justify-center")}
                onClick={() => onFlowChange?.(option.id)}
              >
                {option.icon}
                {!isCollapsed && (
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{option.name}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                )}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>

      {!isCollapsed && (
        <>
          <Separator />
          <div className="p-4">
            <p className="text-xs text-muted-foreground">
              Navigate between pages or select a flow diagram to visualize payment processing
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export { FLOW_OPTIONS, NAVIGATION_OPTIONS }
