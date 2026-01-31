import * as THREE from 'three'
import type { Circle } from '../../shapes/Circle'

export function renderCircle(circle: Circle): THREE.LineLoop {
  const curve = new THREE.EllipseCurve(
    0, 0,                     // local center
    circle.radius,            // x radius
    circle.radius,            // y radius
    0,
    Math.PI * 2,
    false,
    0
  )

  const points = curve.getPoints(64)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const material = new THREE.LineBasicMaterial({
    color: circle.color ?? '#000000',
  })

  const line = new THREE.LineLoop(geometry, material)

  // position
  line.position.set(circle.center.x, circle.center.y, 0)

  // visibility
  line.visible = circle.visible !== false

  // required for selection & raycasting
  line.userData = {
    id: circle.id,
    type: circle.type,
  }

  return line
}
