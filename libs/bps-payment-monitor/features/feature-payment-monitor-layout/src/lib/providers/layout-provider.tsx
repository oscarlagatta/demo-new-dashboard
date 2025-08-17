"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  currentTitle: string
  setCurrentTitle: (title: string) => void
  breadcrumbs: Array<{ name: string; href?: string }>
  setBreadcrumbs: (breadcrumbs: Array<{ name: string; href?: string }>) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

interface LayoutProviderProps {
  children: React.ReactNode
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTitle, setCurrentTitle] = useState("Payment Monitor")
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ name: string; href?: string }>>([])

  const value: LayoutContextType = {
    sidebarOpen,
    setSidebarOpen,
    currentTitle,
    setCurrentTitle,
    breadcrumbs,
    setBreadcrumbs,
  }

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}
