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
    material: MeshBasicMaterial
    mesh: Line
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
        this.camera.position.z = 60
        this.camera.position.y = 10
        this.clock = new Clock()

        this.mesh = buildPlane(200, 20)
        this.step = 200 / 20
        this.shift = 0
        this.scene.add(this.mesh)

        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))

        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85)
        bloomPass.threshold = 0
        bloomPass.strength = 1.1
        bloomPass.radius = 1

        this.composer.addPass(bloomPass)
    }

    onEnter() {}

    update(now: number) {
        this.shift += 0.6
        if (this.shift > this.step) {
            this.shift = this.shift - this.step
        }
        this.mesh.position.setZ(0 + this.shift)

        // const geo = this.mesh.geometry as Geometry
        // for (let i = 0; i < geo.vertices.length; i++) {
        //     geo.vertices[i].setY(Math.random() * 5 - 2)
        // }
        // geo.verticesNeedUpdate = true

        this.composer.render()
    }
}

const setHeight = (geo: Geometry, x: number, y: number) => {}

const buildPlane = (size: number, segments: number, color = SynthColors.Purple) => {
    const geo = new Geometry()
    const material = new LineBasicMaterial({ color, linewidth: 13 })
    const step = size / segments
    const half = size / 2
    for (let x = 0; x <= segments; x++) {
        for (let y = 0; y <= segments; y++) {
            if (x !== segments) {
                geo.vertices.push(new Vector3(x * step - half, y * step - half, 0))
                geo.vertices.push(new Vector3((x + 1) * step - half, y * step - half, 0))
            }

            if (y !== segments) {
                geo.vertices.push(new Vector3(x * step - half, y * step - half, 0))
                geo.vertices.push(new Vector3(x * step - half, (y + 1) * step - half, 0))
            }
            // geo.vertices.push(new Vector3(x * step - half, -half, 0))
            // geo.vertices.push(new Vector3(x * step - half, half, 0))

            // geo.vertices.push(new Vector3(-half, x * step - half, 0))
            // geo.vertices.push(new Vector3(half, x * step - half, 0))
        }
    }

    geo.rotateX(Math.PI / 2)

    let line = new LineSegments(geo, material)
    return line
}
