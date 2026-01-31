import { ShapeManager } from '../../core/ShapeManager'
import './ShapeFileList.css'

export class ShapeFileList {
  public element: HTMLDivElement
  private list: HTMLDivElement

  constructor(private shapeManager: ShapeManager) {
    this.element = document.createElement('div')
    this.element.className = 'shape-file-list' 

    const header = document.createElement('h3')
    header.textContent = 'Shape Files'
    this.element.appendChild(header)

    this.list = document.createElement('div')
    this.element.appendChild(this.list)

    this.shapeManager.subscribe(() => this.render())
    this.shapeManager.subscribeSelection(() => this.render())

    this.render()
  }

  private render(): void {
    this.list.innerHTML = ''

    const selectedId = this.shapeManager.getSelectedShape()?.id ?? null

    this.shapeManager.getShapes().forEach(shape => {
      const row = document.createElement('div')
      row.className = 'shape-row'
      if (shape.id === selectedId) row.classList.add('active')

      /* ---------- Left: Icon + Name ---------- */
      const left = document.createElement('div')
      left.className = 'shape-left'
      left.onclick = () => this.shapeManager.selectShape(shape.id)

      const icon = document.createElement('span')
      icon.className = `shape-icon ${shape.type}`

      const name = document.createElement('span')
      name.textContent = shape.id

      left.appendChild(icon)
      left.appendChild(name)

      /* ---------- Right: Actions ---------- */
      const actions = document.createElement('div')
      actions.className = 'shape-actions'

      const eye = document.createElement('button')
      eye.innerHTML = shape.visible === false
  ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7"/><path d="M3 3l18 18"/></svg>'
  : '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7"/><circle cx="12" cy="12" r="3"/></svg>'

      eye.onclick = e => {
        e.stopPropagation()
        this.shapeManager.toggleVisibility(shape.id)
      }

      const del = document.createElement('button')
      del.innerHTML = `
<svg viewBox="0 0 24 24" width="18" height="18"
  stroke="currentColor" fill="none" stroke-width="2">
  <path d="M3 6h18"/>
  <path d="M8 6v14"/>
  <path d="M16 6v14"/>
  <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>
  <path d="M10 6V4h4v2"/>
</svg>
`
      del.onclick = e => {
        e.stopPropagation()
        this.shapeManager.deleteShape(shape.id)
      }

      actions.appendChild(eye)
      actions.appendChild(del)

      row.appendChild(left)
      row.appendChild(actions)
      this.list.appendChild(row)
    })
  }
}
