/**
 * Ambiente HDRI — Caricamento della environment map equirettangolare.
 *
 * Un'immagine HDRI (High Dynamic Range Image) fotografata a 360°
 * viene usata sia come sfondo della scena che come sorgente di luce
 * ambientale per i materiali PBR.
 *
 * Il PMREMGenerator (Prefiltered Mipmapped Radiance Environment Map)
 * calcola versioni sfocate della texture per simulare riflessioni
 * con diversi livelli di roughness sui materiali.
 */

import { GainMapDecoderMaterial, QuadRenderer } from '@monogrid/gainmap-js/webgpu'
import { EquirectangularReflectionMapping, Euler, Scene, WebGPURenderer } from 'three/webgpu'
import { SRGBColorSpace, LinearSRGBColorSpace } from 'three/webgpu'
import { TextureLoader, HalfFloatType, LinearSRGBColorSpace as LinearSRGB } from 'three'

export async function loadEnvironment(scene: Scene, renderer: WebGPURenderer) {
  
  const loader = new TextureLoader()  
  
  const base = import.meta.env.BASE_URL 
  const [sdr, gainMap, metadata] = await Promise.all([
    loader.loadAsync(base + 'hdr.jpg'),
    loader.loadAsync(base + 'hdr-gainmap.jpg'),
    fetch(base + 'hdr.json').then(r => r.json())
  ])

  sdr.colorSpace = SRGBColorSpace
  gainMap.colorSpace = LinearSRGBColorSpace
  sdr.needsUpdate = true
  gainMap.needsUpdate = true

  const material = new GainMapDecoderMaterial({
    sdr,
    gainMap,
    gainMapMin: metadata.gainMapMin,
    gainMapMax: metadata.gainMapMax,
    gamma: metadata.gamma,
    offsetHdr: metadata.offsetHdr,
    offsetSdr: metadata.offsetSdr,
    hdrCapacityMin: metadata.hdrCapacityMin,
    hdrCapacityMax: metadata.hdrCapacityMax,
    maxDisplayBoost: Math.pow(2, metadata.hdrCapacityMax)
  })

  const quadRenderer = new QuadRenderer({
    width:      sdr.image.width,
    height:     sdr.image.height,
    type:       HalfFloatType,
    colorSpace: LinearSRGB,
    material,
    renderer,
    renderTargetOptions: {
      mapping: EquirectangularReflectionMapping
    }
  })

  await quadRenderer.render()

  const envTexture = quadRenderer.renderTarget.texture

  const rotation = new Euler(Math.PI, 155, 0)
  scene.environment = envTexture
  scene.environmentRotation = rotation
  scene.background = envTexture
  scene.backgroundRotation = rotation

  sdr.dispose()
  gainMap.dispose()
  material.dispose()
}