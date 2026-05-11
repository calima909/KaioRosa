import * as THREE from 'three'

export class WaterCone {
  mesh: THREE.Mesh

  constructor(scene: THREE.Scene, position = new THREE.Vector3()) {
    const geometry = new THREE.ConeGeometry(0.35, 0.5, 12)

    const material = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    })

    this.mesh = new THREE.Mesh(geometry, material)

    this.mesh.position.copy(position)
    this.mesh.position.y += 0.65
    this.mesh.position.x -= 0.48
    this.mesh.position.z += 0.28

    this.mesh.rotation.x = Math.PI  // punta verso l’alto
    this.mesh.rotation.z -= 0.7
    this.mesh.rotation.y -= 0.7
    this.mesh.rotation.x -= 0.1

    const glowGeometry = new THREE.ConeGeometry(0.5, 0.6, 12)

    const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x66ccff,
    transparent: true,
    opacity: 0.1,
    depthWrite: false
    })

    const glow = new THREE.Mesh(glowGeometry, glowMaterial)

    glow.position.set(0, 0.2, 0)
    glow.scale.set(0.9, 0.9, 0.9)

    this.mesh.add(glow)   

    scene.add(this.mesh)
  }
}