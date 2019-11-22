import { Scene, Geometry, PlaneBufferGeometry, ShaderMaterial, Uniform, Color, Mesh, Vector2, DoubleSide } from 'three'
import { withDistortion } from './utils'

export interface RoadOptions {
    width: number
    length: number
    distortion: any
    camera: {
        speed: number
    }
}

export class Road {
    scene: Scene
    options: RoadOptions
    material: ShaderMaterial

    constructor(scene: Scene, options: RoadOptions) {
        this.scene = scene
        this.options = options
    }

    init() {
        const geometry = new PlaneBufferGeometry(this.options.width, this.options.length, 20, 200)

        const material = new ShaderMaterial({
            fragmentShader: require('./road.fs.glsl'),
            vertexShader: withDistortion(require('./road.vs.glsl')),
            // side: DoubleSide,
            uniforms: Object.assign(
                {},
                {
                    uColor: new Uniform(new Color(0x101012)),
                    uTravelLength: new Uniform(this.options.length),
                    uTime: new Uniform(0.0),
                    uCameraSpeed: new Uniform(this.options.camera.speed),
                    uResolution: { type: 'vec2', value: new Vector2(this.options.width, this.options.length) },
                },
                this.options.distortion
            ),
        })

        this.material = material

        const mesh = new Mesh(geometry, material)

        mesh.rotation.x = -Math.PI / 2
        mesh.position.z = -this.options.length / 2

        this.scene.add(mesh)
    }

    update(t: number) {
        this.material.uniforms.uTime.value = t
    }
}
