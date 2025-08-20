import { type Node, type Edge, MarkerType } from "@xyflow/react"

export type AppNode = Omit<Node, "parentNode"> & {
  parentId?: string
}

interface ApiNodeData {
  id: string
  data: { label: string }
  class: string
  type?: string
  label?: string
  title?: string
  subtext?: string
  parentId?: string
}

interface ApiEdgeData {
  id: string
  source: string
  target: string | string[]
  type?: string
}

interface ApiData {
  nodes: ApiNodeData[]
  edges: ApiEdgeData[]
}

const backgroundNodes: AppNode[] = [
  {
    id: "bg-origination",
    type: "background",
    position: { x: 0, y: 0 },
    data: { title: "Origination" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "350px", height: "960px" },
  },
  {
    id: "bg-validation",
    type: "background",
    position: { x: 350, y: 0 },
    data: { title: "Payment Validation and Routing" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "350px", height: "960px" },
  },
  {
    id: "bg-middleware",
    type: "background",
    position: { x: 700, y: 0 },
    data: { title: "Middleware" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "450px", height: "960px" },
  },
  {
    id: "bg-processing",
    type: "background",
    position: { x: 1150, y: 0 },
    data: { title: "Payment Processing, Sanctions & Investigation" },
    draggable: false,
    selectable: false,
    zIndex: -1,
    style: { width: "500px", height: "960px" },
  },
]

const classToParentId: Record<string, string> = {
  origination: "bg-origination",
  "payment validation and routing": "bg-validation",
  middleware: "bg-middleware",
  "payment processing, sanctions and investigation": "bg-processing",
  "payment processing / middleware": "bg-middleware",
  "clearing / settlement": "bg-processing",
}

const sectionPositions: Record<string, { baseX: number; positions: { x: number; y: number }[] }> = {
  "bg-origination": {
    baseX: 50,
    positions: [
      { x: 50, y: 100 },
      { x: 50, y: 220 },
      { x: 50, y: 340 },
      { x: 50, y: 460 },
      { x: 50, y: 580 },
      { x: 50, y: 700 },
    ],
  },
  "bg-validation": {
    baseX: 425,
    positions: [
      { x: 425, y: 100 },
      { x: 425, y: 220 },
      { x: 425, y: 340 },
      { x: 425, y: 480 },
      { x: 425, y: 590 },
      { x: 425, y: 700 },
    ],
  },
  "bg-middleware": {
    baseX: 750,
    positions: [
      { x: 750, y: 220 },
      { x: 950, y: 400 },
      { x: 750, y: 340 },
      { x: 950, y: 220 },
      { x: 750, y: 460 },
    ],
  },
  "bg-processing": {
    baseX: 1200,
    positions: [
      { x: 1200, y: 160 },
      { x: 1420, y: 160 },
      { x: 1310, y: 300 },
      { x: 1310, y: 420 },
      { x: 1200, y: 580 },
      { x: 1200, y: 700 },
      { x: 1200, y: 820 },
    ],
  },
}

export async function loadFlowData(jsonFileName: string): Promise<{ nodes: AppNode[]; edges: Edge[] }> {
  try {
    const response = await fetch(`/data/${jsonFileName}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${jsonFileName}: ${response.status} ${response.statusText}`)
    }
    const apiData: ApiData = await response.json()
    return transformApiData(apiData)
  } catch (error) {
    console.error(`Failed to load flow data from ${jsonFileName}:`, error)
    return { nodes: backgroundNodes, edges: [] }
  }
}

function transformApiData(apiData: ApiData): { nodes: AppNode[]; edges: Edge[] } {
  const sectionCounters: Record<string, number> = {
    "bg-origination": 0,
    "bg-validation": 0,
    "bg-middleware": 0,
    "bg-processing": 0,
  }

  const transformedNodes: AppNode[] = apiData.nodes
    .map((apiNode): AppNode | null => {
      if (apiNode.type === "background") {
        return {
          id: apiNode.id,
          type: "background",
          position: { x: 0, y: 0 },
          data: { title: apiNode.label || "Background" },
          draggable: false,
          selectable: false,
          zIndex: -1,
          style: { width: "350px", height: "960px" },
        }
      }

      if (apiNode.parentId) {
        return {
          id: apiNode.id,
          type: "custom",
          position: { x: 0, y: 0 },
          data: {
            title: apiNode.title || apiNode.data?.label || `Node ${apiNode.id}`,
            subtext: apiNode.subtext || `AIT ${apiNode.id}`,
          },
          parentId: apiNode.parentId,
          extent: "parent",
        }
      }

      const parentId = classToParentId[apiNode.class]
      if (!parentId) {
        console.warn(`Unknown class: ${apiNode.class} for node ${apiNode.id}`)
        return null
      }

      const sectionConfig = sectionPositions[parentId]
      const positionIndex = sectionCounters[parentId]++
      const position = sectionConfig.positions[positionIndex] || {
        x: sectionConfig.baseX,
        y: 100 + positionIndex * 120,
      }

      return {
        id: apiNode.id,
        type: "custom" as const,
        position,
        data: {
          title: apiNode.data.label,
          subtext: `AIT ${apiNode.id}`,
        },
        parentId: parentId,
        extent: "parent",
      }
    })
    .filter((n): n is AppNode => n !== null)

  const edgeStyle = { stroke: "#6b7280", strokeWidth: 2 }
  const marker = { type: MarkerType.ArrowClosed, color: "#6b7280" }

  const transformedEdges = apiData.edges.flatMap((apiEdge) => {
    const { source, target } = apiEdge
    if (Array.isArray(target)) {
      return target.map((t) => ({
        id: `${source}-${t}`,
        source: source,
        target: t,
        type: "smoothstep",
        style: edgeStyle,
        markerStart: marker,
        markerEnd: marker,
      }))
    } else {
      return [
        {
          ...apiEdge,
          target: target,
          type: "smoothstep",
          style: edgeStyle,
          markerStart: marker,
          markerEnd: marker,
        },
      ]
    }
  })

  return {
    nodes: [...backgroundNodes, ...transformedNodes],
    edges: transformedEdges,
  }
}
