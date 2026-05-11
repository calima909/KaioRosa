import {
  NeutralToneMapping,
  PerspectiveCamera,
  Scene,
  WebGPURenderer,
} from 'three/webgpu'

export interface EngineContext {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGPURenderer
  onResize: () => void
}

/**
 * Crea e restituisce il contesto dell'engine.
 * @param container - L'elemento DOM dentro cui agganciare il canvas
 * @returns {EngineContext} - Il contesto dell'engine
 */
export async function createEngine (container: HTMLElement): Promise<EngineContext> {
  const scene = new Scene()

  // aspect ratio: rapporto larghezza/altezza del contenitore.
  // Serve alla camera per non deformare la prospettiva.
  const aspect = container.clientWidth / container.clientHeight
  const camera = new PerspectiveCamera(45, aspect, 0.1, 1000)

  const renderer = new WebGPURenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.toneMapping = NeutralToneMapping
  renderer.toneMappingExposure = 1.0

  container.appendChild(renderer.domElement)

  await renderer.init()

  function onResize () {
    const width = container.clientWidth
    const height = container.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  window.addEventListener('resize', onResize)

  return { scene, camera, renderer, onResize }
}
