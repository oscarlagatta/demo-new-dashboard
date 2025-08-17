"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface NavigationItem {
  name: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/payment-monitor" },
  { name: "Transactions", href: "/payment-monitor/transactions" },
  { name: "System Health", href: "/payment-monitor/health" },
  { name: "Flow Diagram", href: "/payment-monitor/flows" },
  { name: "Node Manager", href: "/payment-monitor/nodes" },
  { name: "Analytics", href: "/payment-monitor/analytics" },
]

interface MainNavigationProps {
  currentPath: string
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ currentPath }) => {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-6">
        <div className="flex space-x-8">
          {navigationItems.map((item) => {
            const isActive = currentPath === item.href || currentPath.startsWith(`${item.href}/`)

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "inline-flex items-center px-1 pt-4 pb-4 border-b-2 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
