import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { Clock } from 'three'

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
    defaultLights: THREE.PointLight[] = []
    clock: Clock

    constructor(params?: Params) {
        if (params) {
            this.scene = params.scene
            this.camera = params.camera
            this.renderer = params.renderer
        }
        this.clock = new Clock()
    }

    build() {}

    update(now: number, track: TrackSync) {}

    onEnter() {}

    onExit() {}

    onBeat(b: any) {}

    onSegment(s: any) {}

    setDefaultLights() {
        if (!this.defaultLights.length) {
            this.defaultLights = []
            this.defaultLights[0] = new THREE.PointLight(0xffffff, 1, 0)
            this.defaultLights[1] = new THREE.PointLight(0xffffff, 1, 0)
            this.defaultLights[2] = new THREE.PointLight(0xffffff, 1, 0)

            this.defaultLights[0].position.set(0, 200, 0)
            this.defaultLights[1].position.set(100, 200, 100)
            this.defaultLights[2].position.set(-100, -200, -100)
        }

        this.scene.add(this.defaultLights[0])
        this.scene.add(this.defaultLights[1])
        this.scene.add(this.defaultLights[2])
    }

    dispose() {}
}
