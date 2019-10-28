import * as React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ThreeScene } from './scene/base'
import { CubeScene } from './scene/cube'
import { TrackSync } from 'utils/track'
import { waitForTime } from 'utils/index'
import { ipcRenderer } from 'electron'
import { SpotifyEvents } from 'utils/types'

interface Props {
    vscene?: ThreeScene
    active: boolean
}

interface State {
    fps: number
    active: boolean
}

const style = {
    height: window.innerHeight,
}

export class ThreeVisualizer extends React.Component<Props, State> {
    el: HTMLDivElement
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    renderer: THREE.WebGLRenderer
    requestID: number
    fpsID: any
    vscene: ThreeScene
    frames: number = 0

    ring: THREE.Mesh

    state = {
        fps: 0,
        active: true,
    }
    sync: TrackSync

    componentDidMount() {
        this.sceneSetup()
        this.startAnimationLoop(0)
        this.startTrack()
        this.setupHelpers()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize)
        window.document.body.removeEventListener('keydown', this.handleKeyDown)
        window.cancelAnimationFrame(this.requestID)
        this.controls.dispose()
        this.fpsID && clearInterval(this.fpsID)
    }

    sceneSetup() {
        const width = this.el.clientWidth
        const height = this.el.clientHeight

        this.scene = new THREE.Scene()

        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

        this.camera.position.z = 6

        this.controls = new OrbitControls(this.camera, this.el)
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(width, height)
        this.el.appendChild(this.renderer.domElement)

        if (this.props.vscene) {
            this.vscene = this.props.vscene
            this.vscene.scene = this.scene
            this.vscene.camera = this.camera
            this.vscene.renderer = this.renderer
        } else {
            this.vscene = new CubeScene({
                camera: this.camera,
                scene: this.scene,
                renderer: this.renderer,
            }) as CubeScene
        }

        this.vscene.build()
        this.vscene.onEnter()
    }

    setupHelpers() {
        window.addEventListener('resize', this.handleWindowResize.bind(this))
        window.document.body.addEventListener('keydown', this.handleKeyDown.bind(this))

        this.fpsID = setInterval(() => {
            this.setState({ fps: this.frames })
            this.el.style.cursor = 'none'
            this.frames = 0
        }, 1000)

        ipcRenderer.on(SpotifyEvents.TrackAnalysis, (_event, playbackState, data) => {
            this.sync.setTrack(data)
            this.sync.processPlaybackState(playbackState)
        })
    }

    startAnimationLoop(now: any) {
        this.frames += 1

        if (this.sync) {
            this.sync.tick(now)
        }

        if (this.state.active) {
            if (!this.vscene.composer) {
                this.vscene.update(now, this.sync)
                this.renderer.render(this.scene, this.camera)
            } else {
                this.vscene.update(now, this.sync)
            }
        }

        this.requestID = window.requestAnimationFrame(this.startAnimationLoop.bind(this))
    }

    async startTrack() {
        this.sync = new TrackSync({ volumeSmoothing: 5 })
        // await waitForTime(1000)
        // ipcRenderer.send(SpotifyEvents.Play, 'spotify:track:5Jc21xaya2MrHp2KOetrBq', 'track')
        await waitForTime(1000)

        ipcRenderer.send(SpotifyEvents.TrackAnalysis)

        this.sync.on('beat', this.vscene.onBeat.bind(this.vscene))
    }

    handleKeyDown(event) {
        if (event.code === 'Space') {
            this.setState({ active: !this.state.active })
        } else if (event.code === 'Enter') {
            ipcRenderer.send('FULLSCREEN', true)
        } else if (event.code === 'Escape') {
            ipcRenderer.send('FULLSCREEN', false)
        }
    }

    handleWindowResize() {
        this.el.style.height = window.innerHeight + 'px'
        const width = this.el.clientWidth
        const height = this.el.clientHeight

        this.renderer.setSize(width, height)
        this.camera.aspect = width / height

        this.camera.updateProjectionMatrix()

        if (this.vscene.composer) {
            this.vscene.composer.setSize(width, height)
        }
    }

    render() {
        const tempo = this.sync ? this.sync.state.activeIntervals.sections.tempo : 0
        return (
            <>
                <div
                    style={style}
                    ref={ref => (this.el = ref)}
                    onMouseMove={() => (this.el.style.cursor = 'default')}
                ></div>
                <div style={{ position: 'absolute', color: 'white', top: '5px', left: '5px' }}>
                    {this.state.fps} fps ; tempo - {tempo}
                </div>
            </>
        )
    }
}
