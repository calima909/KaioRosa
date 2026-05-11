/**
 * Orchestratore Three.js — Punto d'ingresso del modulo 3D.
 *
 * Questo file collega tutti i sotto-moduli Three.js e fornisce
 * una singola funzione `initScene()` che Vue chiama da onMounted().
 *
 * REATTIVITÀ VUE <-> THREE.JS:
 * - `watch` sul router: navigazione -> GSAP anima camera/controlli verso il target.
 * - Ogni frame: proiezione hotspot -> store reactive -> i componenti Vue aggiornano il DOM (vedi HotspotMarker).
 */
import gsap from 'gsap'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Timer, Vector3 } from 'three/webgpu'
import { watch } from 'vue'

import router from '@/router'

import { createAnimations, setupControls, updateAnimations } from './animations'
import { loadEnvironment } from './environment'
import { createHotspotMarkers, updateHotspotScreenPositions } from './hotspots'
import { loadModel } from './loadModel'
import { createPostProcessing } from './postprocessing'
import { createEngine } from './setup'

import { WaterCone } from './waterFountain.ts'

import { setupTrackSound, playHouseSound, playFountainSound, playCarSound, disposeAudio } from './sounds.ts'
//import { Inspector } from 'three/addons/inspector/Inspector.js'

/**
 * Inizializza l'intera scena 3D dentro il contenitore HTML fornito.
 *
 * @param container - L'elemento DOM che ospiterà il canvas WebGPU
 * @returns Una funzione di cleanup da chiamare in onUnmounted()
 */
export async function initScene (container: HTMLElement): Promise<() => void> {
  // 1. Creare il motore di rendering
  const { scene, camera, renderer, onResize } = await createEngine(container)

  // Inspector commentato per evitare errore fetch su json del enviroment
  // const inspector = new Inspector()
  // inspector.setRenderer(renderer)
  // container.appendChild(inspector.domElement)

  // 2. Caricare l'ambiente HDRI
  await loadEnvironment(scene, renderer)

  // 3. Caricare il modello GLB con materiali baked
  const model = await loadModel(scene)

  // 4.0. Creo la fontana in three.js
  const fountainObject = model.getObjectByName('fontana')

  const fountain = new WaterCone(
    scene,
    fountainObject
      ? fountainObject.position.clone()
      : new Vector3(0, 0, 0)
  )
  fountain.mesh.visible = false

  // 4. Preparare le animazioni procedurali
  const animations = createAnimations(model, fountain)

  // 4.1 Setup controlli e Audio
  setupControls()
  setupTrackSound()

  // 5. Configurare la pipeline di post-processing
  const postProcessing = createPostProcessing(renderer, scene, camera)

  // 6. Posizionare la camera e i controlli orbitali
  camera.position.set(-30, 20, 10)
  camera.lookAt(0, 0, 0)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enablePan = false
  controls.minDistance = 10
  controls.maxDistance = 30
  controls.target.set(0, 0, 0)
  controls.update()

  // 7. Trovare gli oggetti 3D per gli hotspot
  const markers = createHotspotMarkers(model)

  // 8. Vue -> Three.js: osservare il router per animare la camera
  const _target = new Vector3()
  const defaultFov = camera.fov
  const zoomedFov = 30  

  const stopWatch = watch(
    () => router.currentRoute.value.params.id,
    (id) => {
      const marker = id ? markers.find(m => m.id === id) : undefined

      if (id === 'casa') {
        playHouseSound()       
      }
      else if (id === 'fontana') {
        playFountainSound()
      }
      else if (id === 'car') {
        playCarSound()
      }
      if (marker) {
        marker.object.getWorldPosition(_target)
        _target.y += marker.offsetY
        gsap.to(controls.target, { x: _target.x, y: _target.y, z: _target.z, duration: 1, ease: 'power2.inOut' })
        gsap.to(camera, { fov: zoomedFov, duration: 1, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() })
      } else {
        gsap.to(controls.target, { x: 0, y: 0, z: 0, duration: 1, ease: 'power2.inOut' })
        gsap.to(camera, { fov: defaultFov, duration: 1, ease: 'power2.inOut', onUpdate: () => camera.updateProjectionMatrix() })
      }
    },
    { immediate: true, flush: 'sync' }
  )

  // 9. Avviare il loop di rendering
  // (il passo 8 qui sopra è il watch: GSAP anima controls.target,
  //  e controls.update() nel loop applica lo spostamento ogni frame)
  const timer = new Timer()

  renderer.setAnimationLoop(() => {
    //inspector.begin()
    timer.update()
    const delta = timer.getDelta()
    const elapsed = timer.getElapsed()

    controls.update()

    updateAnimations(animations, elapsed, delta)

    // Three -> Vue: sole coordinate 2D nello store (leggero). Il grafo 3D resta fuori da reactive().
    updateHotspotScreenPositions(markers, camera, container)

    postProcessing.render()
    //inspector.finish()
  })

  // 10. Restituire la funzione di cleanup
  return () => {
    stopWatch()
    renderer.setAnimationLoop(null)
    window.removeEventListener('resize', onResize)
    controls.dispose()
    renderer.dispose()
    disposeAudio()
  }
}
