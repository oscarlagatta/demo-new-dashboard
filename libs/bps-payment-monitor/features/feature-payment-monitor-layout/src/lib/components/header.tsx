"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Menu, Bell, Settings, User } from "lucide-react"

interface HeaderProps {
  title: string
  onMenuClick: () => void
  showMenuButton?: boolean
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick, showMenuButton = true }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showMenuButton && (
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
