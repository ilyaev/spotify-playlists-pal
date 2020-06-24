/* eslint-disable no-unused-vars */
import * as React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ThreeScene } from './scene/base'
import { CubeScene } from './scene/cube'
import { TrackSync } from 'utils/track'
import { ipcRenderer } from 'electron'
import { SpotifyEvents, AppAction, SpotifyStateOnMac } from 'utils/types'

interface Props {
    vscene?: ThreeScene
    active: boolean
    onNextScene: (b: any) => void
}

interface State {
    fps: number
    active: boolean
    isDev: boolean
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
    pingMacID: any
    pingID: any
    vscene: ThreeScene
    frames: number = 0

    ring: THREE.Mesh

    state = {
        fps: 0,
        active: true,
        isDev: (localStorage.getItem('IS_DEV') || '0') === '1' ? true : false,
    }
    sync: TrackSync
    toSwitchScene: boolean = false

    componentDidMount() {
        this.sceneSetup()
        this.startTrack()
        this.setupHelpers()
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleWindowResize)
        window.document.body.removeEventListener('keydown', this.handleKeyDown)
        window.cancelAnimationFrame(this.requestID)
        this.controls.dispose()
        this.scene.dispose()
        this.vscene.dispose()
        this.fpsID && clearInterval(this.fpsID)
        this.pingID && clearInterval(this.pingID)
        this.pingMacID && clearInterval(this.pingMacID)
    }

    componentWillReceiveProps(newProps: Props) {
        if (newProps.vscene !== this.props.vscene) {
            this.vscene.dispose()
            this.vscene = newProps.vscene
            this.scene.remove.apply(this.scene, this.scene.children)
            this.vscene.scene = this.scene
            this.vscene.camera = this.camera
            this.vscene.renderer = this.renderer
            this.toSwitchScene = false
            this.camera.rotation.x = 0
            this.camera.rotation.z = 0
            this.camera.rotation.y = 0
            this.camera.position.y = 0
            this.camera.rotation.x = 0
            this.vscene.build()
            this.vscene.onEnter()
        }
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

        ipcRenderer.on(SpotifyEvents.TrackAnalysis, (_event, playbackState, data, ts) => {
            if (data) {
                this.sync.setTrack(data, playbackState.item.id)
                this.sync.processPlaybackState(playbackState)
            } else {
                this.sync.processPlaybackState(playbackState, true)
            }

            if (!this.requestID) {
                this.startAnimationLoop(0)
            }
        })

        ipcRenderer.on(SpotifyEvents.StateOnMac, (_event, state: SpotifyStateOnMac) => {
            if (state.state === 'playing' && !this.sync.state.active) {
                this.sync.state.active = true
            } else if (state.state === 'paused' && this.sync.state.active) {
                this.sync.state.active = false
            }
            if (this.sync.state.active && Math.abs(state.position * 1000 - this.sync.state.trackProgress) > 3000) {
                ipcRenderer.send(SpotifyEvents.TrackAnalysis, true)
            }
        })

        this.pingMacID = setInterval(() => {
            ipcRenderer.send(SpotifyEvents.StateOnMac)
        }, 1000)

        this.pingID = setInterval(() => {
            ipcRenderer.send(SpotifyEvents.TrackAnalysis, true)
        }, 10000)
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
        this.sync = new TrackSync({ volumeSmoothing: 4 })
        this.sync.on('beat', b => this.vscene.onBeat(b))
        this.sync.on('segment', s => this.vscene.onSegment(s))
        this.sync.on('bar', b => {
            this.props.onNextScene(b)
        })
        this.sync.state.watch('finished', this.onFinishTrack.bind(this))
        this.sync.state.watch('active', active => {
            if (active !== this.state.active) {
                this.setState({ active })
            }
        })

        ipcRenderer.send(SpotifyEvents.TrackAnalysis)
    }

    async onFinishTrack(finished: boolean) {
        if (finished) {
            ipcRenderer.send(SpotifyEvents.TrackAnalysis, true)
            this.sync.state.finished = false
        }
    }

    async handleKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') {
            this.setState({ active: !this.state.active })
        } else if (event.code === 'Enter') {
            this.state.isDev
                ? ipcRenderer.send(AppAction.Fullscreen, true)
                : ipcRenderer.send(AppAction.ExitBrowserState, true)
        } else if (event.code === 'Escape') {
            ipcRenderer.send(AppAction.ExitBrowserState, true)
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
        if (!this.props.active) {
            return <div>Loading...</div>
        }

        const progress = this.sync ? this.sync.state.trackProgress / 1000 : 0
        const trackName = this.sync ? this.sync.state.currentlyPlaying.name : 'NOTHING'

        return (
            <>
                <div
                    style={style}
                    ref={ref => (this.el = ref)}
                    onMouseMove={() => (this.el.style.cursor = 'default')}
                ></div>
                {this.state.isDev ? (
                    <div style={{ position: 'absolute', color: 'white', top: '5px', left: '5px' }}>
                        {this.state.fps} fps ; tempo - {tempo} ; playing - {trackName} ; progress -{' '}
                        {progress.toFixed(1)} ;
                    </div>
                ) : null}
            </>
        )
    }
}
