"use client"

import { useEffect } from "react"

/**
 * Suppress benign "ResizeObserver loop ..." errors caused by browser bugs
 * that can occur with layout/size-reactive libraries (e.g., React Flow).
 * This prevents noisy, uncaught errors without affecting real errors.
 */
export function AppInit() {
  useEffect(() => {
    const isResizeObserverError = (msg?: string) =>
      !!msg &&
      (msg.includes("ResizeObserver loop completed with undelivered notifications") ||
        msg.includes("ResizeObserver loop limit exceeded"))

    const onError = (event: ErrorEvent) => {
      if (isResizeObserverError(event?.message)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason
      const msg = typeof reason === "string" ? reason : reason?.message
      if (isResizeObserverError(msg)) {
        event.stopImmediatePropagation()
        event.preventDefault()
      }
    }

    window.addEventListener("error", onError)
    window.addEventListener("unhandledrejection", onUnhandledRejection)
    return () => {
      window.removeEventListener("error", onError)
      window.removeEventListener("unhandledrejection", onUnhandledRejection)
    }
  }, [])

  return null
}
