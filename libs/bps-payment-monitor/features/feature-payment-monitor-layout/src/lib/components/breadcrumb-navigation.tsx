"use client"

import React from "react"

import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbNavigationProps {
  currentPath: string
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({ currentPath }) => {
  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    const segments = path.split("/").filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ name: "Home", href: "/" }]

    let currentHref = ""
    segments.forEach((segment, index) => {
      currentHref += `/${segment}`
      const isLast = index === segments.length - 1

      // Convert segment to readable name
      const name = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

      breadcrumbs.push({
        name,
        href: isLast ? undefined : currentHref,
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs(currentPath)

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500">
      <Home className="h-4 w-4" />
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-700 transition-colors">
              {item.name}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.name}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
