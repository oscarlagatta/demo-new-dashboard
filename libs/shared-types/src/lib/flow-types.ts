import type React from "react"
export interface FlowNode {
  id: string
  data: { label: string }
  class: string
  type?: string
  parentId?: string
}

export interface FlowEdge {
  id: string
  source: string
  target: string | string[]
  type?: string
}

export interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface FlowOption {
  id: string
  name: string
  description: string
  icon?: React.ReactNode
  jsonFile: string
}
