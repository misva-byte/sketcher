import * as THREE from 'three'
import type { Polyline } from '../../shapes/Polyline'

export function renderPolyline(shape: Polyline): THREE.Line {
  const points = shape.points.map(
    p => new THREE.Vector3(p.x, p.y, 0)
  )

  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const material = new THREE.LineBasicMaterial({
    color: shape.color ?? '#000000',
  })

  const line = new THREE.Line(geometry, material)

  // ✅ visibility (safe default)
  line.visible = shape.visible !== false

  // ✅ required for selection / raycasting
  line.userData = {
    id: shape.id,
    type: shape.type,
  }

  return line
}
