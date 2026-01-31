import * as THREE from 'three'
import type { Ellipse } from '../../shapes/Ellipse'

export function renderEllipse(ellipse: Ellipse): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(1, 64)

  const material = new THREE.MeshBasicMaterial({
    color: ellipse.color ?? '#000000',
    wireframe: true,
  })

  const mesh = new THREE.Mesh(geometry, material)

  // position & scale
  mesh.position.set(ellipse.center.x, ellipse.center.y, 0)
  mesh.scale.set(ellipse.radiusX, ellipse.radiusY, 1)

  // visibility
  mesh.visible = ellipse.visible !== false

  // required for selection / hit test
  mesh.userData = {
    id: ellipse.id,
    type: ellipse.type,
  }

  return mesh
}
