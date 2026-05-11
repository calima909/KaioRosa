import { reactive } from 'vue'

export type Hotspot = {
  objectName: string
  offsetY: number
  offsetX: number
  offsetZ: number
  x: number
  y: number
  visible: boolean
  label: string
  description: string
}

/**
 * Store hotspot — dati UI + aggancio al modello 3D.
 *
 * Qui teniamo solo dati leggeri (stringhe, numeri, flag). Niente istanze Three.js:
 * oggetti Mesh/Scene dentro `reactive()` verrebbero avvolti da Proxy e rallenterebbero il loop.
 * Three.js aggiorna x, y, visible ogni frame; il resto è configurazione statica.
 *
 * Per ogni voce: objectName = nome mesh nel GLB; offsetY alza il marker; label/description = UI.
 */
export const hotspots = reactive<Record<string, Hotspot>>({
  car: {
    objectName: 'macchina',
    offsetY: 0,
    offsetX: 0,
    offsetZ: 0,
    label: 'Macchina di Re Kaio',
    x: 0,
    y: 0,
    visible: false,
    description: `Questa è la macchina di Re Kaio, un veicolo unico che può viaggiare a velocità incredibili ma sfortunatamente non può andare fuori strada!
    <br><br>
    [Premi Freccia su e giù per andare avanti e indietro]`
  },
  casa: {
    objectName: 'casa1',
    offsetY: -0.3,
    offsetX: -1.5,
    offsetZ: -0.3,
    label: 'Casa di Re Kaio',
    x: 0,
    y: 0,
    visible: false,
    description: `La casa di Re Kaio è un luogo di pace e tranquillità, dove il tempo sembra scorrere più lentamente, meglio non disturbarlo...`
  },
  fontana: {
    objectName: 'fontana',
    offsetY: -0.1,
    offsetX: -1,
    offsetZ: -0.2,
    label: 'Fontana Sacra',
    x: 0,
    y: 0,
    visible: false,
    description: `L'acqua di questa fontana è così pura che può guarire qualsiasi ferita!
    <br><br>
    [Premi Spazio per accendere e spegnere la fontana]`
  },
  
})