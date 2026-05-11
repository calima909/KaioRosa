import type { Group, PerspectiveCamera } from 'three/webgpu'

import { Object3D, Vector3 } from 'three/webgpu'

import { hotspots } from '@/store/hotspots'

/** Riferimento al nodo GLB + offset (lo store fornisce objectName/offsetY). */
export interface HotspotMarker3D {
  id: string
  object: Object3D
  offsetY: number
  offsetX: number
  offsetZ: number
}

export function createHotspotMarkers (model: Group): HotspotMarker3D[] {
  const markers: HotspotMarker3D[] = []

  for (const [id, config] of Object.entries(hotspots)) {
    const object = model.getObjectByName(config.objectName)
    if (!object) {
      console.warn(`Hotspot "${id}": oggetto "${config.objectName}" non trovato nel GLB`)
    }
    markers.push({
      id,
      object: object ?? new Object3D(),
      offsetY: config.offsetY,
      offsetX: config.offsetX,
      offsetZ: config.offsetZ
    })
  }

  return markers
}

// Un solo Vector3 riusato ogni frame: niente allocazioni nel loop (GC più felice).
const _worldPos = new Vector3()

export function updateHotspotScreenPositions (
  markers: HotspotMarker3D[],
  camera: PerspectiveCamera,
  container: HTMLElement
) {
  const width = container.clientWidth
  const height = container.clientHeight
  // Dopo OrbitControls.update(), la camera ha position/quaternion nuovi ma matrixWorld può essere "stale":
  // `project()` usa quella matrice quindi senza questo update
  // i marker sarebbero un frame in ritardo.
  camera.updateMatrixWorld()

  for (const marker of markers) {
    const entry = hotspots[marker.id as keyof typeof hotspots]
    if (!entry) continue

    marker.object.getWorldPosition(_worldPos)
    _worldPos.y += marker.offsetY
    _worldPos.x += marker.offsetX
    _worldPos.z += marker.offsetZ

    // Clip space: x,y in [-1,1], z profondità; z ≥ 1 -> dietro il far plane -> nascondi.
    _worldPos.project(camera)

    if (_worldPos.z >= 1) {
      entry.visible = false
      continue
    }

    entry.visible = true
    // NDC -> pixel: asse Y dello schermo web cresce verso il basso, quindi il segno su y.
    entry.x = (_worldPos.x * 0.5 + 0.5) * width
    entry.y = (-_worldPos.y * 0.5 + 0.5) * height
  }
}
