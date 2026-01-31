import * as THREE from 'three'
import type { Ellipse } from '../../shapes/Ellipse'
import { getWorldPoint } from './Coordinate'
import { ToolInteraction } from './ToolInteraction'
import { generateId } from '../../core/id'

export class EllipseDrawing implements ToolInteraction {
  private scene: THREE.Scene
  private camera: THREE.Camera
  private domElement: HTMLElement
  private onComplete: (ellipse: Ellipse) => void

  private isDrawing = false
  private center: THREE.Vector3 | null = null
  private previewMesh: THREE.Mesh | null = null

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    onComplete: (ellipse: Ellipse) => void
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
    this.center = getWorldPoint(event, this.domElement, this.camera)

    const geometry = new THREE.CircleGeometry(1, 64)
    const material = new THREE.MeshBasicMaterial({
      color: '#000000',
      wireframe: true,
    })

    this.previewMesh = new THREE.Mesh(geometry, material)
    this.previewMesh.position.copy(this.center)

    this.scene.add(this.previewMesh)
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isDrawing || !this.center || !this.previewMesh) return

    const point = getWorldPoint(event, this.domElement, this.camera)

    const radiusX = Math.abs(point.x - this.center.x)
    const radiusY = Math.abs(point.y - this.center.y)

    // Scale the unit circle to ellipse
    this.previewMesh.scale.set(radiusX, radiusY, 1)
  }

  private onPointerUp = (event: PointerEvent) => {
    if (!this.center || !this.previewMesh) return

    const point = getWorldPoint(event, this.domElement, this.camera)

    const ellipse: Ellipse = {
      id: generateId('Ellipse'),
      type: 'ellipse',
      center: {
        x: this.center.x,
        y: this.center.y,
      },
      radiusX: Math.abs(point.x - this.center.x),
      radiusY: Math.abs(point.y - this.center.y),
      color: '#000000',
      visible: true,
    }

    console.log('✅ Ellipse completed:', ellipse)

    this.scene.remove(this.previewMesh)
    this.previewMesh.geometry.dispose()
    ;(this.previewMesh.material as THREE.Material).dispose()

    this.previewMesh = null
    this.center = null
    this.isDrawing = false

    this.onComplete(ellipse)
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)
  }
}
