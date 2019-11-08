import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { getRandomColor } from 'utils/index'

interface VelocityVector extends THREE.Vector3 {
    velocity: number
    acceleration: number
}

const rotations = ['x', 'y', 'z']

export class StarsScene extends ThreeScene {
    track: TrackSync
    geo: THREE.Geometry
    stars: THREE.Points
    starMaterial: THREE.PointsMaterial
    direction: number = 1
    rotation: string

    build() {
        // this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
        this.camera.fov = 90
        this.camera.position.z = 1
        this.camera.rotation.x = Math.PI / 2

        this.geo = new THREE.Geometry()
        for (let i = 0; i < 6000; i++) {
            const star = new THREE.Vector3(
                Math.random() * 600 - 300,
                Math.random() * 600 - 300,
                Math.random() * 600 - 300
            ) as VelocityVector
            star.velocity = 0
            star.acceleration = Math.random() * 0.08
            this.geo.vertices.push(star)
        }
        const sprite = new THREE.TextureLoader().load('static/star.png')
        this.starMaterial = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            map: sprite,
            blending: THREE.AdditiveBlending,
            transparent: true,
            size: 1,
        })

        this.stars = new THREE.Points(this.geo, this.starMaterial)
        this.scene.add(this.stars)
    }

    onEnter() {
        this.camera.position.setZ(6)
    }

    onBeat(beat: any) {
        // this.starMaterial.color.setRGB(...getRandomColor(1))
        this.direction = Math.random() > 0.5 ? -1 : 1
        this.rotation = rotations[Math.round(Math.random() * 3)]
        // console.log(this.track.state.activeIntervals)
    }

    update(now: number, track: TrackSync) {
        let volume = Math.min(track && track.volume ? track.volume : 0, 10)
        if (volume >= 10) {
            volume = 0.5
        }
        // this.camera.position.setY(-200 + Math.pow(volume, 10))
        this.track = track

        const extraVelocity = track ? 0.1 * ((track.state.activeIntervals.sections.tempo || 100) / 100) : 0

        this.geo.vertices.forEach((star: VelocityVector) => {
            star.velocity += star.acceleration
            star.y -= star.velocity + extraVelocity
            if (star.y < -200) {
                star.y = 200
                star.velocity = 0
            }
        })

        this.starMaterial.size = Math.max(0.2, Math.pow(volume, 2))

        this.stars.rotation[this.rotation] += 0.005 * Math.pow(volume, 3) * this.direction
        this.geo.verticesNeedUpdate = true
    }
}
