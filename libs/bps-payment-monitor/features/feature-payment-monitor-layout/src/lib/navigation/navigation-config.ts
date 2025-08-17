export interface NavigationRoute {
  path: string
  name: string
  icon?: string
  children?: NavigationRoute[]
  badge?: string
  description?: string
}

export const PAYMENT_MONITOR_ROUTES: NavigationRoute[] = [
  {
    path: "/payment-monitor",
    name: "Dashboard",
    icon: "home",
    description: "Overview of payment system status",
  },
  {
    path: "/payment-monitor/transactions",
    name: "Transactions",
    icon: "credit-card",
    badge: "live",
    description: "Real-time transaction monitoring",
  },
  {
    path: "/payment-monitor/health",
    name: "System Health",
    icon: "activity",
    description: "System health and performance metrics",
  },
  {
    path: "/payment-monitor/flows",
    name: "Flow Diagram",
    icon: "git-branch",
    description: "Payment flow visualization",
  },
  {
    path: "/payment-monitor/nodes",
    name: "Node Manager",
    icon: "settings",
    description: "Manage system nodes and connections",
  },
  {
    path: "/payment-monitor/analytics",
    name: "Analytics",
    icon: "bar-chart-3",
    description: "Payment analytics and reporting",
  },
]

export const getRouteByPath = (path: string): NavigationRoute | undefined => {
  return PAYMENT_MONITOR_ROUTES.find((route) => route.path === path)
}

export const getActiveRoute = (currentPath: string): NavigationRoute | undefined => {
  return PAYMENT_MONITOR_ROUTES.find((route) => currentPath === route.path || currentPath.startsWith(`${route.path}/`))
}
