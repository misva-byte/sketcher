
import * as THREE from 'three'
import type { Line } from '../../shapes/Line'
import { getWorldPoint } from './Coordinate'
import { ToolInteraction } from './ToolInteraction'
import { generateId } from '../../core/id'

export class LineDrawing implements ToolInteraction {
  private scene: THREE.Scene
  private camera: THREE.Camera
  private domElement: HTMLElement
  private onComplete: (line: Line) => void

  private isDrawing = false
  private startPoint: THREE.Vector3 | null = null
  private previewLine: THREE.Line | null = null

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    onComplete: (line: Line) => void
  ) {
    this.scene = scene
    this.camera = camera
    this.domElement = domElement
    this.onComplete = onComplete

    this.domElement.addEventListener('pointerdown', this.onPointerDown)
    this.domElement.addEventListener('pointermove', this.onPointerMove)
    this.domElement.addEventListener('pointerup', this.onPointerUp)
  }

  private onPointerDown = (event: PointerEvent) => {
    this.isDrawing = true
    this.startPoint = getWorldPoint(event, this.domElement, this.camera)

    const geometry = new THREE.BufferGeometry().setFromPoints([
      this.startPoint,
      this.startPoint,
    ])

    const material = new THREE.LineBasicMaterial({ color: '#000000' })
    this.previewLine = new THREE.Line(geometry, material)
    this.scene.add(this.previewLine)

    console.log('point', this.startPoint)
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isDrawing || !this.previewLine || !this.startPoint) return

    const endPoint = getWorldPoint(event, this.domElement, this.camera)
    const pos =
      this.previewLine.geometry.attributes.position as THREE.BufferAttribute

    pos.setXYZ(1, endPoint.x, endPoint.y, 0)
    pos.needsUpdate = true
    this.previewLine.geometry.computeBoundingSphere()
  }

  private onPointerUp = () => {
    if (!this.previewLine || !this.startPoint) return

    const pos =
      this.previewLine.geometry.attributes.position as THREE.BufferAttribute

    const line: Line = {
      id: generateId('Line'),
      type: 'line',
      start: { x: this.startPoint.x, y: this.startPoint.y },
      end: { x: pos.getX(1), y: pos.getY(1) },
      color: '#000000',
      visible: true,
    }

    console.log('✅ Line completed:', line)

    this.scene.remove(this.previewLine)
    this.previewLine.geometry.dispose()
    ;(this.previewLine.material as THREE.Material).dispose()

    this.previewLine = null
    this.startPoint = null
    this.isDrawing = false

    this.onComplete(line)

  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)
  }
}
