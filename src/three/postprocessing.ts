import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { pass } from 'three/tsl'
import {
  PerspectiveCamera,
  RenderPipeline,
  Scene,
  WebGPURenderer,
} from 'three/webgpu'

/**
 * Post-processing — Pipeline di effetti visivi.
 *
 * Il post-processing funziona così:
 * 1. La scena viene renderizzata su una texture invisibile (non sullo schermo)
 * 2. Quella texture passa attraverso una catena di shader che la modificano
 * 3. Il risultato finale viene mostrato sullo schermo
 *
 * Qui usiamo la nuova API RenderPipeline di Three.js WebGPU, basata su
 * nodi TSL. A differenza del vecchio EffectComposer (WebGL), ogni effetto
 * è un nodo che trasforma il segnale video nella catena.
 */
export function createPostProcessing (
  renderer: WebGPURenderer,
  scene: Scene,
  camera: PerspectiveCamera
) {
  const renderPipeline = new RenderPipeline(renderer)

  // Il primo nodo cattura la scena renderizzata come texture
  const scenePass = pass(scene, camera)
  const sceneColor = scenePass.getTextureNode('output')

  // Bloom: simula la diffusione della luce nelle ottiche reali.
  // I pixel sopra la soglia (threshold) "sbordano" nell'area circostante.
  const bloomPass = bloom(sceneColor)
  bloomPass.threshold.value = 0.85
  bloomPass.strength.value = 0.4
  bloomPass.radius.value = 0.5

  // L'output finale somma la scena originale con l'effetto bloom
  renderPipeline.outputNode = sceneColor.add(bloomPass)

  return renderPipeline
}
