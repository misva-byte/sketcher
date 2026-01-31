import './EditorLayout.css';

export class EditorLayout {
  public readonly element: HTMLDivElement;

  private top: HTMLDivElement;
  private left: HTMLDivElement;
  private center: HTMLDivElement;
  private right: HTMLDivElement;

  constructor(parent: HTMLElement) {
    // Root
    this.element = document.createElement('div');
    this.element.className = 'editor-root';

    // Top bar
    this.top = document.createElement('div');
    this.top.className = 'editor-top';

    // Body
    const body = document.createElement('div');
    body.className = 'editor-body';

    // Left panel
    this.left = document.createElement('div');
    this.left.className = 'editor-left';

    // Center panel
    this.center = document.createElement('div');
    this.center.className = 'editor-center';

    // Right panel
    this.right = document.createElement('div');
    this.right.className = 'editor-right';

    // Assemble
    body.appendChild(this.left);
    body.appendChild(this.center);
    body.appendChild(this.right);

    this.element.appendChild(this.top);
    this.element.appendChild(body);

    parent.appendChild(this.element);
  }

  setTop(node?: HTMLElement) {
    this.top.innerHTML = '';
    if (node) this.top.appendChild(node);
  }

  setLeft(node?: HTMLElement) {
    this.left.innerHTML = '';
    if (node) this.left.appendChild(node);
  }

  setCenter(node?: HTMLElement) {
    this.center.innerHTML = '';
    if (node) this.center.appendChild(node);
  }

  setRight(node?: HTMLElement) {
    this.right.innerHTML = '';
    if (node) this.right.appendChild(node);
  }
}
