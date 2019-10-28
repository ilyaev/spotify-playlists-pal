import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { DotScreenShader } from 'three/examples/jsm/shaders/DotScreenShader.js'
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js'

export class RocksScene extends ThreeScene {
    root: THREE.Object3D
    volume: number
    track: TrackSync
    composer: EffectComposer
    rgbShift: ShaderPass
    dotEffect: ShaderPass
    rocks: THREE.Mesh[] = []

    build() {
        this.scene.fog = new THREE.Fog(0x000000, 1, 1000)
        this.root = new THREE.Object3D()
        this.scene.add(this.root)
        const geometry = new THREE.SphereBufferGeometry(1, 4, 4)
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true })
        for (let i = 0; i < 100; i++) {
            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
            mesh.position.multiplyScalar(40 + Math.random() * 360)
            mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50
            this.root.add(mesh)
            this.rocks.push(mesh)
        }

        this.scene.add(new THREE.AmbientLight(0x222222))
        const light = new THREE.DirectionalLight(0xffffff)
        light.position.set(1, 1, 1)
        this.scene.add(light)

        // postprocessing
        this.composer = new EffectComposer(this.renderer)
        this.composer.addPass(new RenderPass(this.scene, this.camera))
        const afterimagePass = new AfterimagePass(0.8)
        // this.composer.addPass(afterimagePass)
        this.dotEffect = new ShaderPass(DotScreenShader)
        this.dotEffect.uniforms['scale'].value = 4
        this.composer.addPass(this.dotEffect)
        this.rgbShift = new ShaderPass(RGBShiftShader)
        this.rgbShift.uniforms['amount'].value = 0.0035
        this.composer.addPass(this.rgbShift)
        //

        this.composer.setSize(window.innerWidth, window.innerHeight)
    }

    onEnter() {
        this.camera.position.setZ(400)
    }

    onBeat(beat: any) {
        // this.rgbShift.uniforms['amount'].value = 0.035 * this.track.volume
        // this.composer.setSize(window.innerWidth, window.innerHeight)
        // ;(this.sphere.material as any).color.setRGB(...getRandomColor())
        this.track.volume > 1 &&
            this.rocks.forEach(rock => {
                rock.position.setZ(Math.random() * 400 - 200)
            })
    }

    update(now: number, track: TrackSync) {
        const volume = track && track.volume ? track.volume : 0
        this.root.rotation.x += 0.005 + volume * 0.05
        this.root.rotation.y += 0.01 + volume * 0.05
        this.camera.position.setZ(400 + Math.pow(volume, 3) * 40)
        this.rgbShift.uniforms['amount'].value = 0.005 * Math.pow(volume, 3)
        // this.rgbShift.uniforms['tDiffuse'].value = volume
        // this.dotEffect.uniforms['scale'].value = 4 + Math.pow(volume, 3) * 4
        this.track = track
        this.composer.render()
        this.rocks.forEach((rock, index) => {
            rock.rotation.x += 0.01 + (index / 100) * 0.01
            rock.rotation.y += 0.005 + (index / 100) * 0.005
        })
    }
}
