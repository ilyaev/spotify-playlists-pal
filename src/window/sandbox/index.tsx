import * as React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { ipcRenderer } from 'electron'
import { AppAction } from 'utils/types'
// import { SandboxScene } from './scene'
// import { SandboxScene } from './wave'
// import { SandboxScene } from './lathe'
// import { SandboxScene } from './synth'
import { SandboxScene } from './shaders'

interface Props {}

interface State {
    fps: number
    active: boolean
    isDev: boolean
}

const style = {
    height: window.innerHeight,
}

export class PageSandbox extends React.Component<Props, State> {
    el: HTMLDivElement
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    renderer: THREE.WebGLRenderer
    requestID: number
    fpsID: any
    frames: number = 0
    vscene: SandboxScene

    state = {
        fps: 0,
        active: true,
        isDev: (localStorage.getItem('IS_DEV') || '0') === '1' ? true : false,
    }

    componentDidMount() {
        this.vscene = new SandboxScene()
        this.sceneSetup()
        this.setupHelpers()
        this.startAnimationLoop(0)
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

        this.camera.position.z = 0

        this.controls = new OrbitControls(this.camera, this.el)
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(width, height)
        this.el.appendChild(this.renderer.domElement)

        this.vscene.scene = this.scene
        this.vscene.camera = this.camera
        this.vscene.renderer = this.renderer

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
    }

    startAnimationLoop(now: any) {
        this.frames += 1

        if (!this.vscene.composer) {
            this.vscene.update(now)
            this.renderer.render(this.scene, this.camera)
        } else {
            this.vscene.update(now)
        }

        this.requestID = window.requestAnimationFrame(this.startAnimationLoop.bind(this))
    }

    async handleKeyDown(event: KeyboardEvent) {
        if (event.code === 'Space') {
            this.setState({ active: !this.state.active })
        } else if (event.code === 'Enter') {
            ipcRenderer.send(AppAction.Fullscreen, true)
        } else if (event.code === 'Escape') {
            ipcRenderer.send(AppAction.Fullscreen, false)
        }
    }

    handleWindowResize() {
        this.el.style.height = window.innerHeight + 'px'
        const width = this.el.clientWidth
        const height = this.el.clientHeight

        this.renderer.setSize(width, height)
        this.camera.aspect = width / height

        this.camera.updateProjectionMatrix()
    }

    render() {
        return (
            <>
                <div
                    style={style}
                    ref={ref => (this.el = ref)}
                    onMouseMove={() => (this.el.style.cursor = 'default')}
                ></div>
                {this.state.isDev ? (
                    <div style={{ position: 'absolute', color: 'white', top: '5px', left: '5px' }}>
                        {this.state.fps} fps
                    </div>
                ) : null}
            </>
        )
    }
}
