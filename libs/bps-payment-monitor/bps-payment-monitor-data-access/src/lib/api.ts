import type { PaymentTransaction, PaymentFlow, SystemNode, ApiResponse } from "./types"

const API_BASE_URL = "/api/bps-payment-monitor"

export class PaymentMonitorApi {
  static async getTransactions(): Promise<ApiResponse<PaymentTransaction[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`)
      const data = await response.json()
      return {
        data,
        success: true,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      }
    }
  }

  static async getPaymentFlow(id: string): Promise<ApiResponse<PaymentFlow>> {
    try {
      const response = await fetch(`${API_BASE_URL}/flows/${id}`)
      const data = await response.json()
      return {
        data,
        success: true,
        timestamp: new Date(),
      }
    } catch (error) {
      throw new Error(`Failed to fetch payment flow: ${error}`)
    }
  }

  static async getSystemNodes(): Promise<ApiResponse<SystemNode[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/nodes`)
      const data = await response.json()
      return {
        data,
        success: true,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date(),
      }
    }
  }

  static async updateSystemNode(id: string, updates: Partial<SystemNode>): Promise<ApiResponse<SystemNode>> {
    try {
      const response = await fetch(`${API_BASE_URL}/nodes/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })
      const data = await response.json()
      return {
        data,
        success: true,
        timestamp: new Date(),
      }
    } catch (error) {
      throw new Error(`Failed to update system node: ${error}`)
    }
  }
}
