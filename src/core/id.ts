export type ShapeType = 'Line' | 'Circle' | 'Ellipse' | 'Polyline'

const counters: Record<ShapeType, number> = {
  Line: 0,
  Circle: 0,
  Ellipse: 0,
  Polyline: 0,
}

/**
 * Generate a new ID for a given shape type
 */
export function generateId(type: ShapeType): string {
  counters[type]++
  return `${type}-${counters[type]}`
}

/**
 * Sync counters after loading shapes from JSON
 * Prevents duplicate IDs
 */
export function syncIdCounters(
  shapes: readonly { id: string; type: ShapeType }[]
): void {
  for (const shape of shapes) {
    const match = shape.id.match(/^(\w+)-(\d+)$/)
    if (!match) continue

    const [, type, num] = match
    if (type in counters) {
      counters[type as ShapeType] = Math.max(
        counters[type as ShapeType],
        Number(num)
      )
    }
  }
}
