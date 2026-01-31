import * as THREE from 'three'
import type { Line } from '../../shapes/Line'

export function renderLine(line: Line): THREE.Line {
  const points = [
    new THREE.Vector3(line.start.x, line.start.y, 0),
    new THREE.Vector3(line.end.x, line.end.y, 0),
  ]

  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const material = new THREE.LineBasicMaterial({
    color: line.color ?? '#000000',
  })

  const mesh = new THREE.Line(geometry, material)

  mesh.visible = line.visible !== false
  mesh.userData = { id: line.id, type: line.type }

  return mesh
}
