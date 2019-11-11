import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'
import { Vector2, Material, DoubleSide, Clock, ShaderMaterial } from 'three'

export class CirclesScene extends ThreeScene {
    cube: THREE.Mesh
    volume: number
    track: TrackSync
    material: ShaderMaterial
    clock: Clock

    build() {
        this.camera.fov = 60
        this.camera.position.z = 400
        this.camera.position.y = 0
        this.clock = new Clock()

        const resolution = new Vector2(640, 480)
        let uniforms = {
            t: { type: 'f', value: 0.0 },
            rad: { type: 'f', value: 0.25 },
            u_resolution: { type: 'vec2', value: resolution },
            u_circles: { type: 'i', value: 10 },
            u_size: { type: 'f', value: 0.05 },
            u_volume: { type: 'f', value: 0.0 },
        }

        const geometry = new THREE.PlaneGeometry(resolution.x, resolution.y, 1, 1)
        this.material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: require('../../sandbox/shaders/vs_circles.fs.glsl'),
            side: DoubleSide,
            vertexShader: require('../../sandbox/vertex.glsl'),
        })

        const mesh = new THREE.Mesh(geometry, this.material)

        this.scene.add(mesh)
        // this.setDefaultLights()
    }

    onEnter() {
        // this.camera.position.setZ(6)
    }

    onBeat(beat: any) {
        // ;(this.cube.material as any).color.setRGB(...getRandomColor())
    }

    update(now: number, track: TrackSync) {
        const volume = track && track.volume ? track.volume : 0
        this.material.uniforms.t.value = now / 1000

        this.material.uniforms.u_circles.value = 5 + Math.ceil(volume * 5)
        this.material.uniforms.u_size.value = 0.5 / this.material.uniforms.u_circles.value
        this.material.uniforms.u_volume.value = volume
        this.track = track
    }
}
