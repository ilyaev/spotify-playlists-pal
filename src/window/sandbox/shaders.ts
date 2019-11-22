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
    WireframeGeometry,
    LineSegments,
    GridHelper,
    Geometry,
    Line,
    LineBasicMaterial,
    Material,
    DoubleSide,
    ShaderMaterial,
    Vector2,
} from 'three'
import ease, { easingFunctions } from 'utils/easing'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import MeshLine from 'three.meshline'
enum SynthColors {
    Purple = 0x8f2aa3,
    Blue = 0x42c6ff,
    Pink = 0xff0081,
    Read = 0xf4225a,
    Yellow = 0xf4b80c,
}

export class SandboxScene extends ThreeScene {
    track: TrackSync
    geometry: BufferGeometry
    material: ShaderMaterial
    mesh: Mesh
    wire: WireframeGeometry
    line: LineSegments
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
    shift = 0

    destination: THREE.Vector3
    origin: Vector3

    build() {
        this.camera.fov = 60
        this.camera.position.z = 400
        this.camera.position.y = 0
        this.clock = new Clock()

        this.mesh = this.getExperimentalCube()
        this.scene.add(this.mesh)
    }

    onEnter() {}

    update(now: number) {
        if (this.material) {
            this.material.needsUpdate = true
            this.material.uniforms.t.value = now / 500
            this.material.uniforms.rad.value = Math.random() * 0.7 + 0.1
        }
        // this.mesh.rotation.x += 0.02
        // this.mesh.rotation.y += 0.01
    }

    getExperimentalCube() {
        const resolution = new Vector2(640, 480)
        let uniforms = {
            colorB: { type: 'vec3', value: new THREE.Color(0xacb6e5) },
            colorA: { type: 'vec3', value: new THREE.Color(0x74ebd5) },
            t: { type: 'f', value: 0.0 },
            rad: { type: 'f', value: 0.25 },
            iResolution: { type: 'vec2', value: resolution },
            u_resolution: { type: 'vec2', value: resolution },
            u_circles: { type: 'i', value: 10 },
            u_size: { type: 'f', value: 0.05 },
        }

        let geometry = new THREE.PlaneGeometry(resolution.x, resolution.y, 1, 1)
        // geometry.translate
        this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: require('./shaders/four.fs.glsl'), //require('./shaders/circle.fg.glsl'), // require('./fragment.glsl'),
            side: DoubleSide,
            vertexShader: require('./vertex.glsl'),
        })

        let mesh = new THREE.Mesh(geometry, this.material)
        // mesh.position.x = -2
        return mesh
    }
}
