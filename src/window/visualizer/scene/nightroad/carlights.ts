import {
    Scene,
    Curve,
    LineCurve3,
    Vector3,
    TubeBufferGeometry,
    MeshBasicMaterial,
    Mesh,
    InstancedBufferGeometry,
    InstancedBufferAttribute,
    ShaderMaterial,
    Uniform,
    Color,
    Material,
    Vector2,
} from 'three'

import { withDistortion } from './utils'

interface CarLightsOptions {
    nPairs: number
    roadWidth: number
    roadSections: number
    length: number
    distortion: any
    camera: {
        speed: number
    }
}

export class CarLights {
    options: CarLightsOptions
    scene: Scene
    mesh: Mesh
    color: any
    speed: number
    material: ShaderMaterial

    constructor(scene: Scene, options: CarLightsOptions, color: any, speed: number) {
        this.scene = scene
        this.options = options
        this.color = color
        this.speed = speed
    }

    init() {
        let curve = new LineCurve3(new Vector3(0, 0, 0), new Vector3(0, 0, -1))

        let baseGeometry = new TubeBufferGeometry(curve, 25, 1, 9, false)

        let instanced = new InstancedBufferGeometry().copy(baseGeometry)
        instanced.maxInstancedCount = this.options.nPairs * 2

        const aOffset: number[] = []
        const aMetrics: number[] = []

        const sectionWidth = this.options.roadWidth / this.options.roadSections

        for (let i = 0; i < this.options.nPairs; i++) {
            const radius = Math.random() * 0.1 + 0.1
            const length = Math.random() * this.options.length * 0.08 + this.options.length * 0.02

            const section = i % 3

            const sectionX = section * sectionWidth - this.options.roadWidth / 2 + sectionWidth / 2

            const carWidth = 0.5 * sectionWidth

            const offsetX = 0.5 * Math.random()

            const offsetY = radius * 1.3

            const offsetZ = Math.random() * this.options.length

            aOffset.push(sectionX - carWidth / 2 + offsetX)
            aOffset.push(offsetY)
            aOffset.push(-offsetZ)

            aMetrics.push(radius)
            aMetrics.push(length)

            aOffset.push(sectionX + carWidth / 2 + offsetX)
            aOffset.push(offsetY)
            aOffset.push(-offsetZ)

            aMetrics.push(radius)
            aMetrics.push(length)
        }

        instanced.addAttribute('aOffset', new InstancedBufferAttribute(new Float32Array(aOffset), 3, false))
        instanced.addAttribute('aMetrics', new InstancedBufferAttribute(new Float32Array(aMetrics), 2, false))

        let material = new ShaderMaterial({
            fragmentShader: require('./carlights.fs.glsl'),
            vertexShader: withDistortion(require('./carlights.vs.glsl')),
            uniforms: Object.assign(
                {},
                {
                    uColor: new Uniform(new Color(this.color)),
                    uTime: new Uniform(0),
                    uTravelLength: new Uniform(this.options.length),
                    uSpeed: new Uniform(this.speed),
                    uCameraSpeed: new Uniform(this.options.camera.speed),
                },
                this.options.distortion
            ),
        })

        let mesh = new Mesh(instanced, material)

        mesh.frustumCulled = false

        this.mesh = mesh
        this.material = this.mesh.material as ShaderMaterial
        this.scene.add(mesh)
    }

    update(t: number) {
        this.material.uniforms.uTime.value = t
    }
}
