import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@payment-org/shared-ui"
import { AppInit } from "@payment-org/shared-ui"
import { QueryProvider } from "@payment-org/data-services"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Payment Dashboard",
  description: "Payment processing flow visualization and management",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppInit />
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
