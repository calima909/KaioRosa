import type { Group } from 'three/webgpu'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  Mesh,
  MeshBasicNodeMaterial,
  Scene,
  SRGBColorSpace,
  TextureLoader,
} from 'three/webgpu'

import bakeUrl from '/bake.png'
import modelUrl from '/kaio.glb?url'
import { windShader } from './windShader'

export async function loadModel (scene: Scene): Promise<Group> {
  const textureLoader = new TextureLoader()

  // La bake texture contiene tutta l'illuminazione calcolata offline in Cycles.
  const bakeTexture = await textureLoader.loadAsync(bakeUrl)
  // flipY = false: i GLB seguono la convenzione glTF dove V=0 è in alto,
  // opposto al default di Three.js (V=0 in basso).
  bakeTexture.flipY = false
  bakeTexture.colorSpace = SRGBColorSpace

  // Materiale base: solo la bake texture, nessun calcolo di luce.
  const bakedMaterial = new MeshBasicNodeMaterial({ map: bakeTexture })

  // Materiale per l'albero: stessa bake texture + vertex shader del vento.
  // `positionNode` sovrascrive la posizione dei vertici nel vertex shader,
  // permettendo di spostare i vertici in base al noise (vedi windShader.ts).
  const treeMaterial = new MeshBasicNodeMaterial({ map: bakeTexture })

  const wind = await windShader()
  treeMaterial.positionNode = wind.positionNode

  const gltfLoader = new GLTFLoader()
  const gltf = await gltfLoader.loadAsync(modelUrl)
  const model = gltf.scene

  // Cerchiamo il nodo "tree" nel grafo della scena (nome assegnato in Blender).
  // Le mesh figlie di questo nodo riceveranno il materiale con il vento.
  const treeRoot = model.getObjectByName('chiome')
  const carRoot = model.getObjectByName('macchina')  

  model.traverse((child) => {
    if (child instanceof Mesh) {
      const isTree = treeRoot != null && (child === treeRoot || child.parent === treeRoot)
      if (isTree) {
        child.material = treeMaterial
      }
      // Non applico il bakedmaterial alla macchina
      else if (carRoot != null && (child === carRoot || child.parent === carRoot)) {
        return 
      }
      else {
        child.material = bakedMaterial
      }      
    }
  })

  scene.add(model)
  return model
}
