import { ThreeScene } from './base'
import * as THREE from 'three'
import { TrackSync } from 'utils/track'
import { LatheGeometry, MeshPhongMaterial, Mesh, DoubleSide, BoxGeometry, Group, DirectionalLight } from 'three'
import ease from 'utils/easing'

export class PitchScene extends ThreeScene {
    track: TrackSync
    geometry: LatheGeometry
    material: MeshPhongMaterial
    mesh: Mesh
    clock: THREE.Clock
    speed: number = 1
    beatVolume: number = 18
    bars: Mesh[] = []
    barGroup: Group
    barsCount = 12
    barWidth = 1
    barPadding = 0.2
    curHeight: number[] = []
    nextHeight: number[] = []
    startFrom: number = 0
    endTo: number = 0
    started: number
    segmentIndex: number = -1
    jupiter: DirectionalLight

    build() {
        this.camera.fov = 60

        this.started = this.clock.getElapsedTime()

        this.updateGeo(0.5, [])
        this.setDefaultLights()

        if (!this.jupiter) {
            this.jupiter = new DirectionalLight(0x00ff00, 0)
            // this.jupiter.position = new Vector3(0, -15, 0)
            this.jupiter.target = this.barGroup
        }

        this.scene.add(this.barGroup)
        this.scene.add(this.jupiter)
    }

    updateGeo(volume: number, pitch: number[], segment: any = { duration: 0 }) {
        if (this.bars.length !== this.barsCount) {
            this.barGroup = new Group()
            this.bars = new Array(this.barsCount).fill(0).map((_v, index) => {
                const geo = new BoxGeometry(1, 1, 1, 1, 1, 1)
                this.curHeight.push(0)
                this.nextHeight.push(1)
                this.startFrom = this.clock.getElapsedTime()
                this.endTo = this.clock.getElapsedTime() + 1000
                const cube = new Mesh(
                    geo,
                    new MeshPhongMaterial({
                        color: 0x156289,
                        emissive: 0x072534,
                        flatShading: true,
                        side: DoubleSide,
                    })
                )
                cube.translateX(
                    (this.barWidth + this.barPadding) * index - ((this.barWidth + this.barPadding) * this.barsCount) / 2
                )
                this.barGroup.add(cube)
                this.bars.push(cube)
                return cube
            })
            this.barGroup.rotateX(Math.PI / 8)
            return
        }

        if (pitch.length !== this.barsCount || !segment.index) {
            return
        }

        const perc = (this.clock.getElapsedTime() - this.startFrom) / (this.endTo - this.startFrom)
        const key = this.track && this.track.state ? this.track.state.activeIntervals.sections.key : -1
        this.bars.forEach((bar, index) => {
            const y = this.curHeight[index] + (this.nextHeight[index] - this.curHeight[index]) * ease(perc) //'easeInOutElastic'
            const geo = new BoxGeometry(this.barWidth, y, this.barWidth, 1, 1, 1)
            bar.geometry.dispose()
            bar.geometry = geo

            if (key === index) {
                ;(bar.material as MeshPhongMaterial).color.setHex(0xff0000)
            } else {
                ;(bar.material as MeshPhongMaterial).color.setHex(0x156289)
            }
            // bar.position.y = y / 2
            // bar.position.x = (this.barWidth + this.barPadding) * index
        })
    }

    onEnter() {
        this.camera.position.setZ(12)
        // this.barGroup.position.setY(-5)
        // this.barGroup.position.setX(this.barGroup.positionк.x + 1)
    }

    onSegment(segment: any) {
        if (!this.track || !this.track.state) {
            return
        }
        const volume = this.getVolume()
        const maxH = 10 * volume // Math.max(0.2, 20 + segment.loudness_max)
        this.curHeight = [...this.nextHeight]
        // TODO: Interpolate to next segment, not current
        // const curSegment = this.track.state.trackAnalysis.segments[segment.index]
        const nextSegment = this.track.state.trackAnalysis.segments[segment.index + 1]
        this.nextHeight = (nextSegment ? nextSegment : segment).pitches.map(one => one * maxH)
        this.startFrom = this.clock.getElapsedTime()
        this.endTo = this.startFrom + segment.duration / 1000
        this.segmentIndex = segment.index
        // console.log(Object.assign({}, segment))
    }

    onBeat(beat: any) {
        const track = this.track
        const tempo = this.track ? this.track.state.activeIntervals.sections.tempo : 0
        let volume = Math.min(track && track.volume ? track.volume : 0, 10)
        this.beatVolume = volume
        this.speed = volume * ((3 * tempo) / 160)
        const red = volume / 2
        // this.material.color.setRGB(red, 0, 0)

        // this.track && this.track.state && console.log(this.track.state.activeIntervals.segments.pitches)
    }

    getVolume() {
        let volume = Math.min(this.track && this.track.volume ? this.track.volume : 0, 10)
        if (volume >= 6) {
            volume = 0.5
        } else {
            return volume || 0.1
        }
    }

    update(now: number, track: TrackSync) {
        const volume = this.getVolume()
        this.track = track

        if (this.track && this.track.state) {
            this.updateGeo(
                volume,
                this.track.state.activeIntervals.segments.pitches,
                this.track.state.activeIntervals.segments
            )
        }

        const lightIntensity = volume / 2
        if (lightIntensity < 0.2) {
            this.jupiter.intensity = 1 - lightIntensity
            this.jupiter.color.setHex(0xff0000)
        } else {
            this.jupiter.intensity = lightIntensity
            this.jupiter.color.setHex(0x00ff00)
        }

        // console.log(track.state.activeIntervals)

        // console.log(volume, Math.pow(volume / 2, 3))

        // this.barGroup.rotation.y += 0.02 * this.speed
        // this.barGroup.rotation.z += 0.01 * this.speed
    }
}
