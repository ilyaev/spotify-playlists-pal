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
} from 'three'
import ease, { easingFunctions } from 'utils/easing'

export class SandboxScene extends ThreeScene {
    track: TrackSync
    geometry: BufferGeometry
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

    build() {
        this.camera.fov = 60
        this.camera.position.z = 60
        this.camera.position.y = 10
        // this.camera.rotation.x = Math.PI / 10

        this.clock = new Clock()

        // this.scene.background = new Color(0xaaccff)
        // this.scene.fog = new FogExp2(0xaaccff, 0.0077)

        this.geometry = new PlaneBufferGeometry(150, 150, this.worldWidth - 1, this.worldDepth - 1)
        // this.geometry = new SphereBufferGeometry(50, 20, 20)
        this.geometry.rotateX(-Math.PI / 2)

        const postion = this.geometry.attributes.position
        // postion.usage = THREE.DynamicDrawUsage
        // console.log(THREE.DynamicDrawUsage)

        for (let i = 0; i < postion.count; i++) {
            const y = 5 * Math.sin(i / 4)
            postion.setY(i, y)
        }

        const texture = new TextureLoader().load('static/water.jpg')
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(5, 5)

        this.material = new MeshBasicMaterial({ map: texture, color: 0xaaaaaa, side: THREE.DoubleSide })

        this.mesh = new Mesh(this.geometry, this.material)
        this.scene.add(this.mesh)
    }

    onEnter() {}

    update(now: number) {
        const delta = this.clock.getDelta()
        const time = this.clock.getElapsedTime() * 10

        const position = this.geometry.attributes.position

        for (let i = 0; i < position.count; i++) {
            // i / 5 + (time + i) / 7
            const y = 5 * Math.sin(i / this.shift)
            position.setY(i, y)
        }

        this.shift += this.step
        if (this.shift > 20.4) {
            // this.shift = 19.7
            this.step = -0.01
        }
        if (this.shift < 19.2) {
            this.step = 0.01
        }
        ;(position as any).needsUpdate = true
    }
}
