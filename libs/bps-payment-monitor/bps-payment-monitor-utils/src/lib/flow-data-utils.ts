import type { Node, Edge } from "@xyflow/react"

// Define a custom type for our application's node data, which uses parentId
export type AppNode = Omit<Node, "parentNode"> & {
  parentId?: string
}

// --- Static Section Definitions ---
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

function transformApiData() {}

const { nodes, edges } = transformApiData()

export const initialNodes: AppNode[] = nodes
export const initialEdges: Edge[] = edges
