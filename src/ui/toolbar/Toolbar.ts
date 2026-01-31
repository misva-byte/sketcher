import './Toolbar.css'
import type { Tool } from '../../core/Tool'
import type { ShapeManager } from '../../core/ShapeManager'

type ToolbarOptions = {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  shapeManager: ShapeManager
}

export class Toolbar {
  public readonly element: HTMLDivElement   

  private buttons = new Map<Tool, HTMLButtonElement>()
  private activeTool: Tool
  private onToolChange: (tool: Tool) => void
  private shapeManager: ShapeManager

  constructor({ activeTool, onToolChange, shapeManager }: ToolbarOptions) {
    this.activeTool = activeTool
    this.onToolChange = onToolChange
    this.shapeManager = shapeManager

    this.element = document.createElement('div')
    this.element.className = 'toolbar'

    /* ---------- TOOLS ---------- */
    const group = document.createElement('div')
    group.className = 'tool-group'

    this.createToolButton(group, 'select', 'Select', ICONS.select)
    this.createToolButton(group, 'line', 'Line', ICONS.line)
    this.createToolButton(group, 'circle', 'Circle', ICONS.circle)
    this.createToolButton(group, 'ellipse', 'Ellipse', ICONS.ellipse)
    this.createToolButton(group, 'polyline', 'Polyline', ICONS.polyline)

    this.element.appendChild(group)

    /* ---------- FILE ACTIONS ---------- */
    const fileGroup = document.createElement('div')
    fileGroup.className = 'tool-group'

    fileGroup.appendChild(this.createActionButton('Save', ICONS.save, this.handleSave))
    fileGroup.appendChild(this.createActionButton('Load', ICONS.upload, this.handleLoad))

    this.element.appendChild(fileGroup)

    this.updateActiveTool(activeTool)
  }

  /* ================= BUTTONS ================= */

  private createToolButton(
    parent: HTMLElement,
    tool: Tool,
    label: string,
    icon: string
  ) {
    const btn = document.createElement('button')
    btn.className = 'tool-btn'

    btn.innerHTML = `
      <div class="tool-icon">${icon}</div>
      <div class="tool-label">${label}</div>
    `

    btn.onclick = () => {
      this.setActiveTool(tool)
      this.onToolChange(tool)
    }

    this.buttons.set(tool, btn)
    parent.appendChild(btn)
  }

  private createActionButton(
    label: string,
    icon: string,
    onClick: () => void
  ) {
    const btn = document.createElement('button')
    btn.className = 'tool-btn'

    btn.innerHTML = `
      <div class="tool-icon">${icon}</div>
      <div class="tool-label">${label}</div>
    `

    btn.onclick = onClick
    return btn
  }

  /* ================= STATE ================= */

  setActiveTool(tool: Tool) {
    this.activeTool = tool
    this.updateActiveTool(tool)
  }

  private updateActiveTool(tool: Tool) {
    this.buttons.forEach((btn, key) => {
      btn.classList.toggle('active', key === tool)
    })
  }

  /* ================= SAVE ================= */

  private handleSave = () => {
    const data = this.shapeManager.getSerializableShapes()
    const json = JSON.stringify(data, null, 2)

    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'shapes.json'
    a.click()

    URL.revokeObjectURL(url)
  }

  /* ================= LOAD ================= */

  private handleLoad = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const shapes = JSON.parse(reader.result as string)
          this.shapeManager.loadShapes(shapes)
        } catch {
          alert('Invalid JSON file')
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }
}

/* ================= ICONS ================= */

const ICONS = {
  select: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M3 3l7 18 2-6 6-2z"/>
    </svg>
  `,
  line: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <line x1="4" y1="20" x2="20" y2="4"/>
      <circle cx="4" cy="20" r="1.5"/>
      <circle cx="20" cy="4" r="1.5"/>
    </svg>
  `,
  circle: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `,
  ellipse: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <ellipse cx="12" cy="12" rx="8" ry="5"/>
    </svg>
  `,
  polyline: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <polyline points="4 16 9 8 15 12 20 6"/>
      <circle cx="4" cy="16" r="1.5"/>
      <circle cx="9" cy="8" r="1.5"/>
      <circle cx="15" cy="12" r="1.5"/>
      <circle cx="20" cy="6" r="1.5"/>
    </svg>
  `,
  save: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <path d="M17 21v-8H7v8"/>
      <path d="M7 3v5h8"/>
    </svg>
  `,
  upload: `
    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" stroke-width="2">
      <path d="M12 16V4"/>
      <path d="M8 8l4-4 4 4"/>
      <path d="M4 20h16"/>
    </svg>
  `
}
