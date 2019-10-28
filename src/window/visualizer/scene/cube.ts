import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'

export class CubeScene extends ThreeScene {
    cube: THREE.Mesh
    volume: number
    track: TrackSync

    build() {
        const geometry = new THREE.BoxGeometry(2, 2, 2)
        const material = new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true,
        })
        this.cube = new THREE.Mesh(geometry, material)
        this.scene.add(this.cube)

        this.setDefaultLights()
    }

    onEnter() {
        this.camera.position.setZ(6)
    }

    onBeat(beat: any) {
        console.log(this.track.state.activeIntervals)
        ;(this.cube.material as any).color.setRGB(...getRandomColor())
    }

    update(now: number, track: TrackSync) {
        const volume = track && track.volume ? track.volume : 0
        this.cube.rotation.x += 0.01
        this.cube.rotation.y += 0.01
        this.camera.position.setZ(6 + Math.pow(volume, 3))
        this.track = track
    }
}
