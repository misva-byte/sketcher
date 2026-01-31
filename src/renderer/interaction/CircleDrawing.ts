import * as THREE from 'three'
import type { Circle } from '../../shapes/Circle'
import { generateId } from '../../core/id'
import { ToolInteraction } from './ToolInteraction'

export class CircleDrawing implements ToolInteraction {
  private scene: THREE.Scene
  private camera: THREE.Camera
  private domElement: HTMLElement
  private onComplete: (circle: Circle) => void

  private center: THREE.Vector2 | null = null
  private preview: THREE.Object3D | null = null

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    domElement: HTMLElement,
    onComplete: (circle: Circle) => void
  ) {
    this.scene = scene
    this.camera = camera
    this.domElement = domElement
    this.onComplete = onComplete

    domElement.addEventListener('pointerdown', this.onPointerDown)
    domElement.addEventListener('pointermove', this.onPointerMove)
    domElement.addEventListener('pointerup', this.onPointerUp)
  }

  private getWorldPoint(event: PointerEvent): THREE.Vector2 {
    const rect = this.domElement.getBoundingClientRect()

    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const vector = new THREE.Vector3(x, y, 0)
    vector.unproject(this.camera)

    return new THREE.Vector2(vector.x, vector.y)
  }

  private onPointerDown = (event: PointerEvent) => {
    this.center = this.getWorldPoint(event)
  }

  private onPointerMove = (event: PointerEvent) => {
    if (!this.center) return

    const point = this.getWorldPoint(event)
    const radius = this.center.distanceTo(point)

    if (this.preview) {
      this.scene.remove(this.preview)
      this.disposeObject(this.preview)
    }

    const geometry = new THREE.CircleGeometry(radius, 64)

    // ✅ Filled circle
    const fillMaterial = new THREE.MeshBasicMaterial({
      color: 0x0077ff,
      opacity: 0.3,
      transparent: true,
    })

    const fill = new THREE.Mesh(geometry, fillMaterial)

    // ✅ Outline (optional but recommended)
    const wire = new THREE.LineLoop(
      new THREE.EdgesGeometry(geometry),
      new THREE.LineBasicMaterial({ color: 0x0077ff })
    )

    const group = new THREE.Group()
    group.add(fill)
    group.add(wire)
    group.position.set(this.center.x, this.center.y, 0)

    this.preview = group
    this.scene.add(group)
  }

  private onPointerUp = (event: PointerEvent) => {
    if (!this.center) return

    const point = this.getWorldPoint(event)
    const radius = this.center.distanceTo(point)

    if (this.preview) {
      this.scene.remove(this.preview)
      this.disposeObject(this.preview)
      this.preview = null
    }

    this.onComplete({
      id: generateId('Circle'),
      type: 'circle',
      center: { x: this.center.x, y: this.center.y },
      radius,
      color: '#000000',
      visible: true,
    })

    this.center = null
  }

  private disposeObject(obj: THREE.Object3D) {
    obj.traverse(child => {
      const mesh = child as THREE.Mesh
      mesh.geometry?.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose())
      } else {
        mesh.material?.dispose()
      }
    })
  }

  dispose() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown)
    this.domElement.removeEventListener('pointermove', this.onPointerMove)
    this.domElement.removeEventListener('pointerup', this.onPointerUp)

    if (this.preview) {
      this.scene.remove(this.preview)
      this.disposeObject(this.preview)
    }
  }
}
