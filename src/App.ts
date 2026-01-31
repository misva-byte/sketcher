import { Renderer } from './renderer/Renderer';
import { ShapeManager } from './core/ShapeManager';
import { EditorLayout } from './ui/layout/EditorLayout';
import { Toolbar } from './ui/toolbar/Toolbar';
import type { Tool } from './core/Tool';
import { ShapeFileList } from './ui/left-panel/ShapeFileList';
import { PropertiesPanel } from './ui/right-panel/PropertiesPanel';

export class App {
  private renderer: Renderer | null = null;
  private shapeManager: ShapeManager;
  private activeTool: Tool = 'select';

  private canvasContainer: HTMLDivElement;

  constructor(root: HTMLElement) {
    // Create core state
    this.shapeManager = new ShapeManager();

    // Build layout
    const layout = new EditorLayout(root);

    // Create toolbar
    const toolbar = new Toolbar({
      activeTool: this.activeTool,
      onToolChange: this.handleToolChange,
      shapeManager: this.shapeManager,
    });

    layout.setTop(toolbar.element);

    // Left panel
    const shapeFileList = new ShapeFileList(this.shapeManager);
    layout.setLeft(shapeFileList.element)

    // Center canvas
    this.canvasContainer = document.createElement('div');
    this.canvasContainer.style.width = '100%';
    this.canvasContainer.style.height = '100%';
    layout.setCenter(this.canvasContainer);

    // Right panel
    const propertiesPanel = new PropertiesPanel(this.shapeManager);
    layout.setRight(propertiesPanel.element);

    // Create renderer
    this.renderer = new Renderer(
      this.canvasContainer,
      this.shapeManager
    );

    this.renderer.setActiveTool(this.activeTool);

    console.log('Renderer mounted');
  }

  private handleToolChange = (tool: Tool) => {
    this.activeTool = tool;
    this.renderer?.setActiveTool(tool);

    if (tool === 'select') {
      this.shapeManager.selectShape(null)
    }
    console.log('Active tool:', tool);
  };

  // private createPanel(title: string): HTMLElement {
  //   const div = document.createElement('div');
  //   div.innerText = title;
  //   return div;
  // }

  dispose() {
    this.renderer?.dispose();
    this.renderer = null;
  }
}
