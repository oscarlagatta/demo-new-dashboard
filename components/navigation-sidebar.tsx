"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  MapPin,
  Home,
  BarChart3,
  Settings,
  Users,
  FileText,
  Info,
  Mail,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

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
  onFlowChange?: (flowId: string) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

const NAVIGATION_OPTIONS: NavigationOption[] = [
  {
    id: "home",
    name: "Home",
    description: "Dashboard overview",
    icon: <Home className="h-4 w-4" />,
    href: "/",
  },
  {
    id: "about",
    name: "About",
    description: "Learn about our platform",
    icon: <Info className="h-4 w-4" />,
    href: "/about",
  },
  {
    id: "contact",
    name: "Contact",
    description: "Get in touch with us",
    icon: <Mail className="h-4 w-4" />,
    href: "/contact",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Payment insights and reports",
    icon: <BarChart3 className="h-4 w-4" />,
    href: "/analytics",
  },
  {
    id: "users",
    name: "User Management",
    description: "Manage system users",
    icon: <Users className="h-4 w-4" />,
    href: "/users",
  },
  {
    id: "reports",
    name: "Reports",
    description: "Generate and view reports",
    icon: <FileText className="h-4 w-4" />,
    href: "/reports",
  },
  {
    id: "settings",
    name: "Settings",
    description: "System configuration",
    icon: <Settings className="h-4 w-4" />,
    href: "/settings",
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
  onFlowChange,
  isCollapsed = false,
  onToggleCollapse,
}: Omit<NavigationSidebarProps, "selectedPage" | "onPageChange">) {
  const location = useLocation()
  const currentPath = location.pathname

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
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
              <Link key={option.id} to={option.href || "/"}>
                <Button
                  variant={currentPath === option.href ? "default" : "ghost"}
                  className={cn("w-full justify-start gap-3 h-auto p-3", isCollapsed && "px-2 justify-center")}
                >
                  {option.icon}
                  {!isCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{option.name}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  )}
                </Button>
              </Link>
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

      {/* Footer */}
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

// Export options for use in other components
export { FLOW_OPTIONS, NAVIGATION_OPTIONS }
