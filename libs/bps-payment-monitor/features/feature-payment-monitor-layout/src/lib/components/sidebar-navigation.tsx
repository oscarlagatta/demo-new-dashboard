"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X, Home, CreditCard, Activity, GitBranch, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const sidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/payment-monitor", icon: Home },
  { name: "Transactions", href: "/payment-monitor/transactions", icon: CreditCard, badge: "12" },
  { name: "System Health", href: "/payment-monitor/health", icon: Activity },
  { name: "Flow Diagram", href: "/payment-monitor/flows", icon: GitBranch },
  { name: "Node Manager", href: "/payment-monitor/nodes", icon: Settings },
  { name: "Analytics", href: "/payment-monitor/analytics", icon: BarChart3 },
]

interface SidebarNavigationProps {
  currentPath: string
  onClose: () => void
}

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ currentPath, onClose }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900">BPS Monitor</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <div className="flex items-center">
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-gray-500">Version 1.0.0</div>
      </div>
    </div>
  )
}
