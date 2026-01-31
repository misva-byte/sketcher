import { ShapeManager } from '../../core/ShapeManager'
import type { Shape } from '../../core/ShapeManager'
import type { Polyline } from '../../shapes/Polyline'
import type { Line } from '../../shapes/Line'
import type { Circle } from '../../shapes/Circle'
import type { Ellipse } from '../../shapes/Ellipse'
import './PropertiesPanel.css'

export class PropertiesPanel {
  public element = document.createElement('div')

  constructor(private shapeManager: ShapeManager) {
    this.element.className = 'properties-panel'

    this.shapeManager.subscribe(() => this.render())
    this.shapeManager.subscribeSelection(() => this.render())

    this.render()
  }

  private render() {
    this.element.innerHTML = ''

    const shape = this.shapeManager.getSelectedShape()
    if (!shape) {
      this.element.textContent = 'No shape selected'
      return
    }

    /* ---------- Header ---------- */
    const header = document.createElement('h3')
    header.textContent = shape.id
    this.element.appendChild(header)

    /* ---------- Shape specific ---------- */
    if (shape.type === 'polyline') {
      const draft = structuredClone(shape) as Polyline
      this.renderPolyline(draft)
      this.renderColor(draft)
      this.renderUpdateButton(draft)
    }

    if (shape.type === 'line') {
      const draft = structuredClone(shape) as Line
      this.renderLine(draft)
      this.renderColor(draft)
      this.renderUpdateButton(draft)
    }

    if (shape.type === 'circle') {
      const draft = structuredClone(shape) as Circle
      this.renderCircle(draft)
      this.renderColor(draft)
      this.renderUpdateButton(draft)
    }

    if (shape.type === 'ellipse') {
      const draft = structuredClone(shape) as Ellipse
      this.renderEllipse(draft)
      this.renderColor(draft)
      this.renderUpdateButton(draft)
    }

    /* ---------- Actions ---------- */
    this.renderActions(shape)
  }

  /* ================= POLYLINE ================= */

  private renderPolyline(shape: Polyline) {
    shape.points.forEach((p, i) => {
      const group = document.createElement('div')

      const title = document.createElement('strong')
      title.textContent = `Point ${i + 1}`
      group.appendChild(title)

      group.appendChild(
        this.numberInput('x', p.x, v => (shape.points[i].x = v))
      )
      group.appendChild(
        this.numberInput('y', p.y, v => (shape.points[i].y = v))
      )

      this.element.appendChild(group)
    })
  }

  /* ================= LINE ================= */

  private renderLine(shape: Line) {
    this.element.appendChild(
      this.numberInput('start.x', shape.start.x, v => (shape.start.x = v))
    )
    this.element.appendChild(
      this.numberInput('start.y', shape.start.y, v => (shape.start.y = v))
    )
    this.element.appendChild(
      this.numberInput('end.x', shape.end.x, v => (shape.end.x = v))
    )
    this.element.appendChild(
      this.numberInput('end.y', shape.end.y, v => (shape.end.y = v))
    )
  }

  /* ================= CIRCLE ================= */

  private renderCircle(shape: Circle) {
    this.element.appendChild(
      this.numberInput('center.x', shape.center.x, v => (shape.center.x = v))
    )
    this.element.appendChild(
      this.numberInput('center.y', shape.center.y, v => (shape.center.y = v))
    )
    this.element.appendChild(
      this.numberInput('radius', shape.radius, v => (shape.radius = v))
    )
  }

  /* ================= ELLIPSE ================= */

  private renderEllipse(shape: Ellipse) {
    this.element.appendChild(
      this.numberInput('center.x', shape.center.x, v => (shape.center.x = v))
    )
    this.element.appendChild(
      this.numberInput('center.y', shape.center.y, v => (shape.center.y = v))
    )
    this.element.appendChild(
      this.numberInput('radiusX', shape.radiusX, v => (shape.radiusX = v))
    )
    this.element.appendChild(
      this.numberInput('radiusY', shape.radiusY, v => (shape.radiusY = v))
    )
  }

  /* ================= COLOR ================= */

  private renderColor(shape: Shape) {
    this.element.appendChild(
      this.colorInput('Color', shape.color ?? '#000000', v => (shape.color = v))
    )
  }

  /* ================= ACTIONS ================= */

  private renderActions(shape: Shape) {
    const actions = document.createElement('div')

    const hideBtn = document.createElement('button')
    hideBtn.innerHTML = shape.visible === false
  ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7"/><path d="M3 3l18 18"/></svg>'
  : '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7"/><circle cx="12" cy="12" r="3"/></svg>'
    hideBtn.onclick = () => this.shapeManager.toggleVisibility(shape.id)

    const delBtn = document.createElement('button')
    delBtn.textContent = 'Delete'
    delBtn.onclick = () => this.shapeManager.deleteShape(shape.id)

    actions.appendChild(hideBtn)
    actions.appendChild(delBtn)
    this.element.appendChild(actions)
  }

  private renderUpdateButton(shape: Shape) {
    const btn = document.createElement('button')
    btn.textContent = 'Update'
    btn.onclick = () => {
      this.shapeManager.updateShape(shape)
      console.log('Updated shape:', shape)
    }
    this.element.appendChild(btn)
  }

  /* ================= HELPERS ================= */

  private numberInput(
    label: string,
    value: number,
    onChange: (v: number) => void
  ) {
    const row = document.createElement('div')

    const name = document.createElement('span')
    name.textContent = label

    const input = document.createElement('input')
    input.type = 'number'
    input.value = String(value)
    input.oninput = () => onChange(Number(input.value))

    row.appendChild(name)
    row.appendChild(input)
    return row
  }

  private colorInput(
    label: string,
    value: string,
    onChange: (v: string) => void
  ) {
    const row = document.createElement('div')

    const name = document.createElement('span')
    name.textContent = label

    const input = document.createElement('input')
    input.type = 'color'
    input.value = value
    input.oninput = () => onChange(input.value)

    row.appendChild(name)
    row.appendChild(input)
    return row
  }
}
