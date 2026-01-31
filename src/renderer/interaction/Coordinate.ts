import * as THREE from 'three'

export function getWorldPoint(
    event: PointerEvent,
    domElement: HTMLElement,
    camera: THREE.Camera
): THREE.Vector3 {
    const rect = domElement.getBoundingClientRect()

    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    const vector = new THREE.Vector3(x, y, 0)
    vector.unproject(camera)

    return vector
}