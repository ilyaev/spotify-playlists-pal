import { ThreeScene } from '../visualizer/scene/base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'
import { on } from 'cluster'
import { Vector3 } from 'three'
import ease, { easingFunctions } from 'utils/easing'

interface VelocityVector extends THREE.Vector3 {
    velocity: number
    acceleration: number
}

const rotations = ['x', 'y', 'z']

export class SandboxScene extends ThreeScene {
    track: TrackSync
    geometry: THREE.SphereGeometry
    material: THREE.MeshPhongMaterial
    sphere: THREE.Mesh
    stars: THREE.Points
    starMaterial: THREE.PointsMaterial
    direction: number = 1
    rotation: string
    timeTo: number
    timeStart: number
    time: number
    dirv: Vector3
    easingFunc: string = 'linear'

    shift: number

    destination: THREE.Vector3
    origin: Vector3

    build() {
        this.camera.fov = 90
        this.shift = 0

        this.geometry = new THREE.SphereGeometry(5, 16, 16, 0, Math.PI * 2, 0, Math.PI)
        this.material = new THREE.MeshPhongMaterial({
            color: 0x156289,
            emissive: 0x072534,
            side: THREE.DoubleSide,
            flatShading: true,
        })
        this.sphere = new THREE.Mesh(this.geometry, this.material)
        this.setDefaultLights()

        this.scene.add(this.sphere)
    }

    onEnter() {
        this.camera.position.setZ(10)
        this.moveTo(new THREE.Vector3(5, 0, 0), 1000)
    }

    moveTo(vector: THREE.Vector3, time: number) {
        this.origin = this.sphere.position.clone()
        this.destination = vector
        this.timeStart = new Date().getTime()
        this.timeTo = this.timeStart + time
        this.time = time
        this.dirv = vector.clone().sub(this.sphere.position)
    }

    update(now: number) {
        this.sphere.rotation.x += 0.02
        const ellapsed = (new Date().getTime() - this.timeStart) / this.time
        if (ellapsed < 1) {
            this.sphere.position.copy(
                this.origin.clone().add(this.dirv.clone().multiplyScalar(ease(ellapsed, this.easingFunc)))
            )
        } else {
            const funcs = Object.keys(easingFunctions)
            this.easingFunc = funcs[Math.floor(Math.random() * funcs.length)]
            this.moveTo(
                new Vector3(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5),
                Math.round(Math.random() * 1000 + 500)
            )
        }
    }
}
