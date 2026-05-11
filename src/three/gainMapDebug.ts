import * as THREE from 'three'
import { GainMapLoader } from '@monogrid/gainmap-js'

export async function debugGainMap(gl: THREE.WebGLRenderer) {

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.bottom = '10px'
  container.style.left = '10px'
  container.style.width = '320px'
  container.style.height = '180px'
  container.style.zIndex = '9999'
  container.style.border = '1px solid #444'
  document.body.appendChild(container)

  const log = (msg: string) => {
    const el = document.createElement('div')
    el.style.color = 'white'
    el.style.fontSize = '12px'
    container.appendChild(el)
    el.textContent = msg
  }

  log('🔄 loading gainmap...')

  const loader = new GainMapLoader(gl)

  const result = await loader.loadAsync([
    '/hdr.jpg',
    '/hdr-gainmap.jpg',
    '/hdr.json'
  ])

  log('✅ gainmap loaded')

  const texture = result.toDataTexture()

  if (!texture) {
    log('❌ texture null')
    return
  }

  log(`📦 ${texture.image?.width ?? '?'} x ${texture.image?.height ?? '?'}`)

  // 🔥 WebGL preview renderer
  const previewRenderer = new THREE.WebGLRenderer({ antialias: true })
  previewRenderer.setSize(320, 180)
  container.appendChild(previewRenderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const material = new THREE.MeshBasicMaterial({ map: texture })
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)

  scene.add(quad)

  previewRenderer.render(scene, camera)

  log('🖼️ preview rendered')
}