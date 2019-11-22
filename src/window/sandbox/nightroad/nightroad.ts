import { ThreeScene } from '../../visualizer/scene/base'
import { Road } from './road'
import { CarLights } from './carlights'
import { Uniform, Vector2 } from 'three'

const options = {
    length: 300,
    width: 20,
    roadWidth: 9,
    islandWidth: 2,
    nPairs: 15,
    roadSections: 3,
    distortion: { uDistortionX: new Uniform(new Vector2(1, 1)), uDistortionY: new Uniform(new Vector2(1, 1)) },
    // distortion: { uDistortionX: new Uniform(new Vector2(40, 2.5)), uDistortionY: new Uniform(new Vector2(-40, 2)) },
    // distortion: {
    //     uDistortionX: new Uniform(new Vector2(30, 2.5)),
    //     uDistortionY: new Uniform(new Vector2(0, 0)),
    // },
    camera: {
        z: -5,
        y: 7,
        x: 0,
        speed: 0.8,
    },
}

export class SandboxScene extends ThreeScene {
    road: Road
    leftLights: CarLights
    rightLights: CarLights

    build() {
        this.road = new Road(this.scene, options)
        this.leftLights = new CarLights(this.scene, options, 0xfafafa, -180)
        this.rightLights = new CarLights(this.scene, options, 0xff102a, 60)

        this.road.init()
        this.leftLights.init()
        this.leftLights.mesh.position.setX(-options.roadWidth / 2 - options.islandWidth / 2)

        this.rightLights.init()
        this.rightLights.mesh.position.setX(options.roadWidth / 2 + options.islandWidth / 2)
    }

    onEnter() {
        this.camera.position.z = options.camera.z
        this.camera.position.y = options.camera.y
        this.camera.position.x = options.camera.x

        this.camera.fov = 60
        this.camera.updateProjectionMatrix()

        setInterval(() => {
            options.distortion.uDistortionY.value = new Vector2(40 * Math.random(), 3 * Math.random())
            options.distortion.uDistortionX.value = new Vector2(40 * Math.random(), 3 * Math.random())
        }, 1000)
    }

    update(now: number) {
        let t = now / 1000
        this.rightLights.update(t)
        this.leftLights.update(t)
        this.road.update(t)

        t = t * options.camera.speed

        let shiftY = 1 - Math.abs(options.camera.z * 2) / options.length

        const Y = options.distortion.uDistortionY.value.x * nsin(t - (shiftY * Math.PI) / 2)
        const X = options.distortion.uDistortionX.value.x * nsin(t - Math.PI / 2)

        this.camera.position.setY(options.camera.y + Y)

        this.camera.position.setX(options.camera.x + X)

        const nextY = options.distortion.uDistortionY.value.x * nsin(t - (shiftY * Math.PI) / 2 + 0.1)
        const nextX = options.distortion.uDistortionX.value.x * nsin(t - Math.PI / 2 + 0.1)

        this.camera.rotation.x = (nextY - Y) / 5
        this.camera.rotation.y = (-1 * (nextX - X)) / 7

        this.camera.updateProjectionMatrix()
    }
}

export const nsin = val => Math.sin(val) * 0.5 + 0.5
