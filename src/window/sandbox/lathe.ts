import { ThreeScene } from '../visualizer/scene/base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import {
    Vector3,
    Clock,
    Color,
    FogExp2,
    PlaneBufferGeometry,
    TextureLoader,
    MeshBasicMaterial,
    Mesh,
    SphereBufferGeometry,
    BufferGeometry,
    Vector2,
    LatheGeometry,
    DoubleSide,
    MeshPhongMaterial,
} from 'three'
import ease, { easingFunctions } from 'utils/easing'

export class SandboxScene extends ThreeScene {
    track: TrackSync
    geometry: LatheGeometry
    shift: number = 19.2
    material: MeshBasicMaterial
    mesh: THREE.Mesh
    stars: THREE.Points
    starMaterial: THREE.PointsMaterial
    direction: number = 1
    rotation: string
    timeTo: number
    timeStart: number
    time: number
    dirv: Vector3
    easingFunc: string = 'linear'
    worldWidth = 128
    worldDepth = 128
    clock: Clock
    step: number = 0.01

    destination: THREE.Vector3
    origin: Vector3
    startVolume: number = 10
    nextVolume: number = 10
    volume: number = 10
    startTime: number
    endTime: number

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
        this.volumeTo(5, 1000)
        // this.scene.background = new Color(0xaaaaaa)
    }

    updateGeo(volume: number) {
        this.volume = volume
        const points = new Array(18).fill(0).map((one, i) => {
            return new Vector2(Math.sin(i * 0.2) * (20 - volume * 2) + 9, ((i - 9) * volume) / 2)
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

    volumeTo(nextVolume: number, duration: number) {
        this.nextVolume = nextVolume
        this.startVolume = this.volume
        this.startTime = new Date().getTime()
        this.endTime = this.startTime + duration
    }

    onEnter() {}

    update(now: number) {
        const elapsed = (new Date().getTime() - this.startTime) / (this.endTime - this.startTime)
        this.updateGeo(this.startVolume + ease(elapsed) * (this.nextVolume - this.startVolume))
        if (elapsed >= 1) {
            this.volumeTo(Math.random() * 9 + 1, Math.random() * 200 + 100)
        }
        this.mesh.rotation.y += 0.02
        this.mesh.rotation.z += 0.01
    }
}
