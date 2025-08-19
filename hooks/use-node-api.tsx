import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiData from "@/lib/api-data.json"

// Types based on the actual API data structure
export interface FlowNode {
  id: string
  data?: { label: string }
  class?: string
  type?: string
  label?: string
  parentId?: string
  title?: string
  subtext?: string
}

export interface FlowEdge {
  id: string
  source: string
  target: string | string[]
  type?: string
}

export interface FlowDiagramData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// Mock API functions
const fetchFlowData = async (): Promise<FlowDiagramData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100))
  return apiData as FlowDiagramData
}

const saveNode = async (node: FlowNode): Promise<FlowNode> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return node
}

const deleteNode = async (nodeId: string): Promise<void> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))
}

const saveEdge = async (edge: FlowEdge): Promise<FlowEdge> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))
  return edge
}

const deleteEdge = async (edgeId: string): Promise<void> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 300))
}

export const useFlowData = () => {
  return useQuery({
    queryKey: ["flowData"],
    queryFn: fetchFlowData,
  })
}

export const useCreateNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowData"] })
    },
  })
}

export const useUpdateNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowData"] })
    },
  })
}

export const useDeleteNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowData"] })
    },
  })
}

export const useCreateEdge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveEdge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowData"] })
    },
  })
}

export const useDeleteEdge = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteEdge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flowData"] })
    },
  })
}
