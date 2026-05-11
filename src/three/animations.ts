import type { Group } from 'three/webgpu'

import { Object3D } from 'three/webgpu'
import type { WaterCone } from './waterFountain'


/**
 * Animazioni procedurali — Movimento degli oggetti nel parco.
 *
 * Invece di usare animazioni pre-registrate nel GLB (AnimationMixer),
 * qui calcoliamo le trasformazioni frame-per-frame con funzioni
 * trigonometriche. Questo approccio è perfetto per movimenti
 * ciclici semplici e non richiede dati aggiuntivi nel file 3D.
 *
 * I nomi degli oggetti ("Rock_1", "carousel", "horse") corrispondono
 * ai nomi assegnati in Blender ed esportati nel GLB.
 */

export interface SceneAnimations {
  pivotBase: Object3D
  car: Object3D
  pivotMacchina: Object3D
  fountain?: WaterCone
}

export function createAnimations (model: Group, fountain?: WaterCone): SceneAnimations {
  const pivotBase = model.getObjectByName('pivotBase')
  const car = model.getObjectByName('macchina')
  const pivotMacchina = model.getObjectByName('pivotMacchina')

  return {
    pivotBase: pivotBase ?? new Object3D(),
    car: car ?? new Object3D(),
    pivotMacchina: pivotMacchina ?? new Object3D(),
    fountain
  }
}

// Parametri delle animazioni
const carSpeed = 1

// Flag per il controllo della macchina
let carDirection = 0 // 1 = avanti, -1 = indietro, 0 = fermo
let carStart = false

// Flag per il controllo della fontana
let isFountainOn = false

// Setup listener per i controlli tastiera della macchina

const pivotBaseHeight = 0.03
const pivotBaseSpeed = 1.5

export function updateAnimations (anim: SceneAnimations, elapsed: number, delta: number): void {
  // Animazione globale
  anim.pivotBase.position.y = Math.sin(elapsed * pivotBaseSpeed) * pivotBaseHeight  

  // Animazione della macchina
  if (carDirection !== 0) {
    anim.pivotMacchina.rotation.z += carSpeed * delta * carDirection
  }
  else if (carStart) {
    anim.pivotMacchina.rotation.z += 0.3 * delta
  }

  // Animazione della fontana
  if (anim.fountain) {
    if (isFountainOn) {
      anim.fountain.mesh.visible = true
      anim.fountain.mesh.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.05
    }
    else {
      anim.fountain.mesh.visible = false
    }
  }  
}

export function setupControls (): void {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp') {
      e.preventDefault()
      carDirection = 1
      carStart = true
    } else if (e.code === 'ArrowDown') {
      e.preventDefault()
      carDirection = -1
      carStart = false
    } else if (e.code === 'Space') {
      e.preventDefault()
      isFountainOn = !isFountainOn      
    }   
  })

  window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      carDirection = 0
    }
  })
}