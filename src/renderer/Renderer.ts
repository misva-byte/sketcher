import * as THREE from 'three'
import type { Line } from '../shapes/Line'
import type { Circle } from '../shapes/Circle'
import type { Ellipse } from '../shapes/Ellipse'
import type { Polyline } from '../shapes/Polyline'

import { renderLine } from './shapes/renderLine'
import { renderCircle } from './shapes/renderCircle'
import { renderEllipse } from './shapes/renderEllipse'
import { renderPolyline } from './shapes/renderPolyline'

import { LineDrawing } from './interaction/LineDrawing'
import { CircleDrawing } from './interaction/CircleDrawing'
import { EllipseDrawing } from './interaction/EllipseDrawing'
import { PolylineDrawing } from './interaction/PolylineDrawing'
import { ToolInteraction } from './interaction/ToolInteraction'

import type { ShapeManager, Shape } from '../core/ShapeManager'

export class Renderer {
  private container: HTMLElement
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer

  private meshRegistry = new Map<string, THREE.Object3D>()
  private shapeManager: ShapeManager

  private activeTool: string | null = null
  private interaction: ToolInteraction | null = null

  private raycaster = new THREE.Raycaster()
  private mouse = new THREE.Vector2()

  private resizeObserver: ResizeObserver

  constructor(container: HTMLElement, shapeManager: ShapeManager) {
    this.container = container
    this.shapeManager = shapeManager
    this.container.innerHTML = ''

    /* ---------------- Scene ---------------- */
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color('#fafafa')

    const width = container.clientWidth
    const height = container.clientHeight

    /* ---------------- Camera ---------------- */
    this.camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      0.1,
      1000
    )
    this.camera.position.z = 10

    /* ---------------- Renderer ---------------- */
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(width, height)
    container.appendChild(this.renderer.domElement)

    this.renderer.domElement.style.display = 'block'

    /* ---------------- Resize Observer ---------------- */
    this.resizeObserver = new ResizeObserver(() => this.onResize())
    this.resizeObserver.observe(this.container)

    /* ---------------- Interaction ---------------- */
    this.renderer.domElement.addEventListener(
      'pointerdown',
      this.onPointerDown
    )

    this.animate()

    /* ---------------- Subscriptions ---------------- */
    this.shapeManager.subscribe(() => {
      this.syncShapes(this.shapeManager.getShapes())
    })

    this.shapeManager.subscribeSelection(() => {
      this.updateSelectionStyles()
    })
  }

  /* ================= TOOLS ================= */

  setActiveTool(tool: string | null) {
    if (this.activeTool === tool) return
    this.activeTool = tool
    this.attachTool()
  }

  private attachTool() {
    this.interaction?.dispose()
    this.interaction = null

    if (this.activeTool === 'line') {
      this.interaction = new LineDrawing(
        this.scene,
        this.camera,
        this.renderer.domElement,
        s => this.shapeManager.addShape(s)
      )
    }

    if (this.activeTool === 'circle') {
      this.interaction = new CircleDrawing(
        this.scene,
        this.camera,
        this.renderer.domElement,
        s => this.shapeManager.addShape(s)
      )
    }

    if (this.activeTool === 'ellipse') {
      this.interaction = new EllipseDrawing(
        this.scene,
        this.camera,
        this.renderer.domElement,
        s => this.shapeManager.addShape(s)
      )
    }

    if (this.activeTool === 'polyline') {
      this.interaction = new PolylineDrawing(
        this.scene,
        this.camera,
        this.renderer.domElement,
        s => this.shapeManager.addShape(s)
      )
    }
  }

  /* ================= SELECTION ================= */

  private onPointerDown = (e: PointerEvent) => {
    if (this.activeTool !== 'select') return
    const id = this.hitTest(e)
    this.shapeManager.selectShape(id)
  }

  private hitTest(event: PointerEvent): string | null {
    const rect = this.renderer.domElement.getBoundingClientRect()

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)

    const hits = this.raycaster.intersectObjects(
      [...this.meshRegistry.values()],
      true
    )

    if (!hits.length) return null

    let obj: THREE.Object3D | null = hits[0].object
    while (obj) {
      for (const [id, mesh] of this.meshRegistry) {
        if (mesh === obj) return id
      }
      obj = obj.parent
    }
    return null
  }

  /* ================= LOOP ================= */

  private animate = () => {
    requestAnimationFrame(this.animate)
    this.renderer.render(this.scene, this.camera)
  }

  private onResize = () => {
    const w = this.container.clientWidth
    const h = this.container.clientHeight
    if (!w || !h) return

    this.camera.left = w / -2
    this.camera.right = w / 2
    this.camera.top = h / 2
    this.camera.bottom = h / -2
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(w, h, false)
  }

  /* ================= SYNC ================= */

  private syncShapes(shapes: readonly Shape[]) {
    const ids = new Set(shapes.map(s => s.id))

    this.meshRegistry.forEach((mesh, id) => {
      if (!ids.has(id)) {
        this.disposeMesh(mesh)
        this.scene.remove(mesh)
        this.meshRegistry.delete(id)
      }
    })

    shapes.forEach(shape => {
      const old = this.meshRegistry.get(shape.id)

      if (!old) {
        const mesh = this.createMesh(shape)
        if (mesh) {
          this.scene.add(mesh)
          this.meshRegistry.set(shape.id, mesh)
        }
      } else {
        this.replaceMesh(old, shape)
      }
    })

    this.updateSelectionStyles()
  }

  private replaceMesh(oldMesh: THREE.Object3D, shape: Shape) {
    const newMesh = this.createMesh(shape)
    if (!newMesh) return

    newMesh.visible = oldMesh.visible

    this.disposeMesh(oldMesh)
    this.scene.remove(oldMesh)
    this.scene.add(newMesh)

    this.meshRegistry.set(shape.id, newMesh)
  }

  private updateSelectionStyles() {
    this.shapeManager.getShapes().forEach(shape => {
      const mesh = this.meshRegistry.get(shape.id)
      if (!mesh) return

      mesh.visible = shape.visible !== false

      const material = (mesh as any).material
      if (material?.color) {
        material.color.set(shape.color ?? '#000000')
      }
    })
  }

  /* ================= MESH ================= */

  private createMesh(shape: Shape): THREE.Object3D | null {
    if (shape.type === 'line') return renderLine(shape as Line)
    if (shape.type === 'circle') return renderCircle(shape as Circle)
    if (shape.type === 'ellipse') return renderEllipse(shape as Ellipse)
    if (shape.type === 'polyline') return renderPolyline(shape as Polyline)
    return null
  }

  private disposeMesh(mesh: THREE.Object3D) {
    mesh.traverse(obj => {
      const m = obj as THREE.Mesh
      m.geometry?.dispose()
      if (Array.isArray(m.material)) {
        m.material.forEach(mat => mat.dispose())
      } else {
        m.material?.dispose()
      }
    })
  }

  /* ================= CLEANUP ================= */

  dispose() {
    this.resizeObserver.disconnect()
    this.renderer.domElement.removeEventListener(
      'pointerdown',
      this.onPointerDown
    )

    this.interaction?.dispose()
    this.meshRegistry.forEach(m => this.disposeMesh(m))
    this.meshRegistry.clear()

    this.renderer.dispose()
    this.container.innerHTML = ''
  }
}
