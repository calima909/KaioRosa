import {
  float,
  modelWorldMatrixInverse,
  positionLocal,
  positionWorld,
  texture,
  time,
  vec2,
  vec4,
  vertexColor,
} from 'three/tsl'
import {
  RepeatWrapping,
  TextureLoader,
} from 'three/webgpu'

import perlinUrl from '/perlin.png?url'

/**
 * Wind Shader — Simulazione del vento con TSL (Three Shading Language).
 *
 * TSL è il linguaggio dichiarativo di Three.js per costruire shader:
 * ogni variabile è un *nodo* del grafo, non un valore JavaScript.
 * Il calcolo effettivo avviene sulla GPU, non su CPU.
 *
 * L'idea:
 * 1. Campionare una texture di rumore Perlin usando le coordinate
 *    world-space del vertice come UV (+ scorrimento temporale)
 * 2. Usare il vertex color (dipinto in Blender) come maschera:
 *    rosso = massimo vento, nero = fermo (tronco)
 * 3. Spostare i vertici lungo l'asse X del mondo
 */
export const windShader = async () => {
  const textureLoader = new TextureLoader()

  // RepeatWrapping: la texture si ripete all'infinito in ogni direzione,
  // così possiamo usare coordinate UV arbitrarie senza clamp a 0–1.
  const perlinTexture = await textureLoader.loadAsync(perlinUrl)
  perlinTexture.wrapS = RepeatWrapping
  perlinTexture.wrapT = RepeatWrapping

  const windSpeed = float(0.7)
  const windStrength = float(0.1)
  const noiseScale = float(0.1)

  // UV = posizione world (X,Z) scalata + scorrimento temporale su X
  const pannedUV = vec2(
    positionWorld.x.mul(noiseScale).add(time.mul(windSpeed)),
    positionWorld.z.mul(noiseScale)
  )

  // Campione il canale rosso della texture di noise
  const noise = texture(perlinTexture, pannedUV).r

  // Il vertex color R, dipinto in Blender, maschera l'effetto:
  // 1.0 in cima all'albero, 0.0 alla base del tronco
  const windMask = vertexColor().r

  const displacement = noise.mul(windMask).mul(windStrength)

  // Lo spostamento avviene in world space (asse X del mondo),
  // ma positionNode lavora in local space. Usiamo la matrice
  // inversa del modello per convertire. w=0 -> vettore direzione,
  // ignora la traslazione della matrice.
  const worldOffset = vec4(displacement, float(0), float(0), float(0))
  const localOffset = modelWorldMatrixInverse.mul(worldOffset).xyz
  const positionNode = positionLocal.add(localOffset)

  return { positionNode }
}
