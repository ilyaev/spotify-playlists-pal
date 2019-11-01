import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'
import { Vector2, LatheGeometry, MeshPhongMaterial, Mesh, DoubleSide, Clock, Color } from 'three'

interface VelocityVector extends THREE.Vector3 {
    velocity: number
    acceleration: number
}

const rotations = ['x', 'y', 'z']

export class SquidScene extends ThreeScene {
    track: TrackSync
    geometry: LatheGeometry
    material: MeshPhongMaterial
    mesh: Mesh
    clock: THREE.Clock
    speed: number = 1

    build() {
        this.camera.fov = 60
        this.camera.position.z = 60
        this.clock = new Clock()
        this.updateGeo(10)
        this.setDefaultLights()
        this.material = new MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            flatShading: true,
            side: DoubleSide,
        })
        this.mesh = new Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)
    }

    updateGeo(volume: number) {
        volume = volume * 2 + 4
        const points = new Array(18).fill(0).map((one, i) => {
            return new Vector2(Math.sin(i * (0.2 - volume / 50)) * (20 - volume) + 9, ((i - 9) * volume) / 4)
            // return new Vector2(Math.sin(i * (0.2 - volume / 50)) * (20 - volume) + 9, ((i - 9) * volume) / 4) // Good
        })

        const geometry = new LatheGeometry(points, 16)
        if (this.mesh) {
            this.mesh.geometry.dispose()
            this.mesh.geometry = geometry
            this.geometry = geometry
        } else {
            this.geometry = geometry
        }
    }

    onEnter() {
        this.camera.position.setZ(50)
    }

    onBeat(beat: any) {
        const track = this.track
        const tempo = this.track ? this.track.state.activeIntervals.sections.tempo : 0
        let volume = Math.min(track && track.volume ? track.volume : 0, 10)
        this.speed = volume * ((3 * tempo) / 160)
        const red = volume / 2
        this.material.color.setRGB(red, (red / 2) * volume, (red / 4) * volume)
    }

    update(now: number, track: TrackSync) {
        let volume = Math.min(track && track.volume ? track.volume : 0, 10)
        if (volume >= 10) {
            volume = 0.5
        }
        this.track = track

        this.updateGeo(volume)

        this.mesh.rotation.y += 0.02 * this.speed
        this.mesh.rotation.z += 0.01 * this.speed
    }
}
