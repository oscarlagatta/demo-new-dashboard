"use client"

import type React from "react"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import { FlowDiagram } from "@/components/flow-diagram"
import { NavigationSidebar, FLOW_OPTIONS } from "@/components/navigation-sidebar"
import PaymentSearchBox from "@/components/payment-search-box"
import { TransactionSearchProvider } from "@/components/transaction-search-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign, Info, Mail, FileText, Settings } from "lucide-react"

function DashboardContent() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Dashboard Overview</h2>
        <p className="text-gray-600">Monitor payment flows and system performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flows</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button>View US Wires Flow</Button>
          <Button variant="outline">View Korea Flow</Button>
          <Button variant="outline">Generate Report</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-100 rounded-lg mb-4">
          <Info className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Our Platform</h1>
        <p className="text-lg text-gray-600">
          Streamlining payment processing with advanced visualization and analytics
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              We provide comprehensive payment flow visualization and management tools that help financial institutions
              monitor, analyze, and optimize their payment processing systems in real-time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Real-time payment flow visualization</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Multi-region support (US, Korea, and more)</li>
              <li>• Comprehensive transaction search</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ContactPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-lg mb-4">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-lg text-gray-600">Get in touch with our team for support or inquiries</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>We're here to help with any questions or support needs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600">support@paymentdashboard.com</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Business Hours</h3>
            <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
          </div>
          <Button className="w-full">Send Message</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function GenericPage({ title, icon, description }: { title: string; icon: React.ReactNode; description: string }) {
  return (
    <div className="p-6 flex items-center justify-center h-full">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg mb-4">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
        <p className="text-sm text-gray-500 mt-4">This page is under development</p>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedFlow, setSelectedFlow] = useState<string>()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const selectedFlowOption = FLOW_OPTIONS.find((option) => option.id === selectedFlow)
  const flowDataFile = selectedFlowOption?.jsonFile

  const handleFlowChange = (flowId: string) => {
    setSelectedFlow(flowId)
  }

  const isShowingFlow = selectedFlow && flowDataFile

  return (
    <TransactionSearchProvider>
      <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Navigation Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Payment Dashboard</h1>
            </div>
          </div>
        </div>

        {isShowingFlow && (
          <div className="flex-shrink-0">
            <PaymentSearchBox />
          </div>
        )}

        {/* Main content with sidebar */}
        <div className="flex-grow flex">
          <NavigationSidebar
            selectedFlow={selectedFlow}
            onFlowChange={handleFlowChange}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />

          {/* Main content section */}
          <main className="flex-grow bg-white">
            {isShowingFlow ? (
              <div className="p-4 sm:p-6 lg:p-8 pt-4 h-full">
                <div className="bg-white rounded-lg border shadow-sm h-full w-full">
                  <FlowDiagram flowDataFile={flowDataFile} />
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<DashboardContent />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route
                  path="/analytics"
                  element={
                    <GenericPage
                      title="Analytics"
                      icon={<BarChart3 className="h-6 w-6" />}
                      description="Payment insights and reports"
                    />
                  }
                />
                <Route
                  path="/users"
                  element={
                    <GenericPage
                      title="User Management"
                      icon={<Users className="h-6 w-6" />}
                      description="Manage system users"
                    />
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <GenericPage
                      title="Reports"
                      icon={<FileText className="h-6 w-6" />}
                      description="Generate and view reports"
                    />
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <GenericPage
                      title="Settings"
                      icon={<Settings className="h-6 w-6" />}
                      description="System configuration"
                    />
                  }
                />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </TransactionSearchProvider>
  )
}
