export function getTrendColor(trend: number): string {
  if (trend > 0) return "text-green-600"
  if (trend < 0) return "text-red-600"
  return "text-gray-600"
}

export function getTrendIcon(trend: number): string {
  if (trend > 0) return "↗"
  if (trend < 0) return "↘"
  return "→"
}
