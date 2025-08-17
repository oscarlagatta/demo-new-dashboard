"use client"

import type React from "react"
import { useState } from "react"
import { MainNavigation } from "./main-navigation"
import { SidebarNavigation } from "./sidebar-navigation"
import { Header } from "./header"
import { BreadcrumbNavigation } from "./breadcrumb-navigation"

interface PaymentMonitorLayoutProps {
  children: React.ReactNode
  currentPath?: string
  title?: string
}

export const PaymentMonitorLayout: React.FC<PaymentMonitorLayoutProps> = ({
  children,
  currentPath = "/",
  title = "Payment Monitor",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        >
          <SidebarNavigation currentPath={currentPath} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} showMenuButton={true} />

          {/* Main navigation */}
          <MainNavigation currentPath={currentPath} />

          {/* Breadcrumb */}
          <div className="px-6 py-2 border-b bg-white">
            <BreadcrumbNavigation currentPath={currentPath} />
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
