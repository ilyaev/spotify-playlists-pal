import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'

interface Params {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
}

export class ThreeScene {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    composer: EffectComposer

    constructor(params?: Params) {
        if (params) {
            this.scene = params.scene
            this.camera = params.camera
            this.renderer = params.renderer
        }
    }

    build() {}

    update(now: number, track: TrackSync) {}

    onEnter() {}

    onBeat(b: any) {}

    onSegment(s: any) {}

    setDefaultLights() {
        const lights = []
        lights[0] = new THREE.PointLight(0xffffff, 1, 0)
        lights[1] = new THREE.PointLight(0xffffff, 1, 0)
        lights[2] = new THREE.PointLight(0xffffff, 1, 0)

        lights[0].position.set(0, 200, 0)
        lights[1].position.set(100, 200, 100)
        lights[2].position.set(-100, -200, -100)

        this.scene.add(lights[0])
        this.scene.add(lights[1])
        this.scene.add(lights[2])
    }

    dispose() {}
}
