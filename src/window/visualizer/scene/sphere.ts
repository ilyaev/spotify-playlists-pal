import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'

export class SphereScene extends ThreeScene {
    sphere: THREE.Mesh
    volume: number
    track: TrackSync

    build() {
        const geometry = new THREE.SphereGeometry(2, 5, 5)
        const material = new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true,
        })
        this.sphere = new THREE.Mesh(geometry, material)
        this.scene.add(this.sphere)

        this.setDefaultLights()
    }

    onEnter() {
        this.camera.position.setZ(6)
    }

    onBeat(beat: any) {
        ;(this.sphere.material as any).color.setRGB(...getRandomColor())
    }

    update(now: number, track: TrackSync) {
        const volume = track && track.volume ? track.volume : 0
        this.sphere.rotation.x += 0.005 + volume * 0.05
        this.sphere.rotation.y += 0.01 + volume * 0.05
        this.camera.position.setZ(6 + Math.pow(volume, 3))
        this.track = track
    }
}
