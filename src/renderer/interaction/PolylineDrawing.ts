import * as THREE from 'three'
import type { Polyline } from '../../shapes/Polyline'
import { getWorldPoint } from './Coordinate'
import { ToolInteraction } from './ToolInteraction'
import { generateId } from '../../core/id'

export class PolylineDrawing implements ToolInteraction {
  private scene: THREE.Scene
  private camera: THREE.Camera
  private domElement: HTMLElement
  private onComplete: (polyline: Polyline) => void

  private isDrawing = false

  // committed vertices
  private points: THREE.Vector3[] = []

  // temporary cursor point
  private previewPoint: THREE.Vector3 | null = null

  private previewLine: THREE.Line | null = null

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    onComplete: (polyline: Polyline) => void
  ) {
    this.scene = scene
    this.camera = camera
    this.domElement = domElement
    this.onComplete = onComplete

    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('pointermove', this.onPointerMove)
    this.domElement.addEventListener('dblclick', this.onDoubleClick)
  }

  /* ---------------- Events ---------------- */

  private onPointerDown = (event: PointerEvent) => {
    const point = getWorldPoint(event, this.domElement, this.camera)

    // start polyline
    if (!this.isDrawing) {
      this.isDrawing = true
      this.points = []
    }

    // push committed vertex
    this.points.push(point.clone())
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isDrawing) return

    this.previewPoint = getWorldPoint(event, this.domElement, this.camera)
    this.updatePreview()
  }

  private onDoubleClick = () => {
    if (!this.isDrawing || this.points.length < 2) return

    this.points.pop()

    // remove preview
    this.removePreview()

    const polyline: Polyline = {
      id: generateId('Polyline'),
      type: 'polyline',
      points: this.points.map(p => ({ x: p.x, y: p.y })),
      color: '#000000',
      visible: true,
    }

    console.log('🟣 Polyline completed:', polyline)

    this.onComplete(polyline)
    this.reset()
  }

  /* ---------------- Preview ---------------- */

  private updatePreview() {
    if (!this.previewPoint || this.points.length === 0) return

    const previewPoints = [...this.points, this.previewPoint]

    // recreate geometry every time (SAFE)
    this.removePreview()

    const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints)
    const material = new THREE.LineBasicMaterial({ color: '#000000' })

    this.previewLine = new THREE.Line(geometry, material)
    this.scene.add(this.previewLine)
  }

  private removePreview() {
    if (!this.previewLine) return

    this.scene.remove(this.previewLine)
    this.previewLine.geometry.dispose()
    ;(this.previewLine.material as THREE.Material).dispose()
    this.previewLine = null
  }

  /* ---------------- Cleanup ---------------- */

  private reset() {
    this.isDrawing = false
    this.points = []
    this.previewPoint = null
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('dblclick', this.onDoubleClick)
    this.removePreview()
    this.reset()
  }
}
