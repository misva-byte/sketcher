import type { Line } from '../shapes/Line'
import type { Circle } from '../shapes/Circle'
import type { Ellipse } from '../shapes/Ellipse'
import type { Polyline } from '../shapes/Polyline'

/* ================= SHAPE TYPE ================= */

export type Shape = (Line | Circle | Ellipse | Polyline) & {
  visible?: boolean
  color?: string            
}

/* ================= MANAGER ================= */

export class ShapeManager {
  private shapes: Shape[] = []
  private selectedShapeId: string | null = null

  private listeners: (() => void)[] = []
  private selectionListeners: (() => void)[] = []

  /* ---------------- SUBSCRIPTIONS ---------------- */

  subscribe(listener: () => void): void {
    this.listeners.push(listener)
  }

  subscribeSelection(listener: () => void): void {
    this.selectionListeners.push(listener)
  }

  private notify(): void {
    this.listeners.forEach(l => l())
  }

  private notifySelection(): void {
    this.selectionListeners.forEach(l => l())
  }

  /* ---------------- SHAPES ---------------- */

  addShape(shape: Shape): void {
    if (this.shapes.some(s => s.id === shape.id)) {
      throw new Error(`Shape with id "${shape.id}" already exists`)
    }

    this.shapes.push({
      ...shape,
      visible: shape.visible ?? true,
      color: shape.color ?? '#000000', // ✅ default color
    })

    this.notify()
  }

  getShapes(): readonly Shape[] {
    return this.shapes
  }

//   save

  getSerializableShapes() {
    return this.shapes.map(shape => ({
      ...shape
    }))
  }

   /* ---------- LOAD ---------- */

  loadShapes(shapes: Shape[]): void {
    this.shapes = []

    shapes.forEach(shape => {
      this.shapes.push({
        ...shape,
        visible: shape.visible ?? true,
        color: shape.color ?? '#000000',
      })
    })

    this.selectedShapeId = null
    this.notify()
    this.notifySelection()
  }

  /** Mutate existing shape (VERY IMPORTANT for renderer) */
  updateShape(updatedShape: Shape): void {
    const existing = this.shapes.find(s => s.id === updatedShape.id)
    if (!existing) return

    Object.assign(existing, {
      ...updatedShape,
      visible: updatedShape.visible ?? existing.visible ?? true,
      color: updatedShape.color ?? existing.color ?? '#000000',
    })

    this.notify()
  }

  deleteShape(id: string): void {
    this.shapes = this.shapes.filter(s => s.id !== id)

    if (this.selectedShapeId === id) {
      this.selectedShapeId = null
      this.notifySelection()
    }

    this.notify()
  }

  clear(): void {
    this.shapes = []
    this.selectedShapeId = null

    this.notify()
    this.notifySelection()
  }

  /* ---------------- SELECTION ---------------- */

  selectShape(id: string | null): void {
    this.selectedShapeId = id
    this.notifySelection()
  }

  getSelectedShape(): Shape | null {
    return this.shapes.find(s => s.id === this.selectedShapeId) || null
  }

  isSelected(id: string): boolean {
    return this.selectedShapeId === id
  }

  /* ---------------- VISIBILITY ---------------- */

  toggleVisibility(id: string): void {
    const shape = this.shapes.find(s => s.id === id)
    if (!shape) return

    shape.visible = !shape.visible
    this.notify()
  }
}
