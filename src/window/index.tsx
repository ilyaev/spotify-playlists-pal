import * as React from 'react'
import { bem, waitForTime } from 'src/utils'
import {
    SpotifyPlaylist,
    SpotifyEvents,
    SpotifyMe,
    SpotifyPlaybackState,
    BrowserState,
    PlayerAction,
} from 'utils/types'
import { ipcRenderer } from 'electron'
import { ProgressCircle, View } from 'react-desktop/macOs'
import { PageSettings } from './settings'
import { PagePlayer } from './player'
import { ThreeVisualizer } from './visualizer'

const styles = bem('spotify')
import './index.less'
// import { SphereScene } from './visualizer/scene/sphere'
// import { RocksScene } from './visualizer/scene/rocks'
import { StarsScene } from './visualizer/scene/stars'
import { PageSandbox } from './sandbox'
import { SquidScene } from './visualizer/scene/squid'
import { PitchScene } from './visualizer/scene/pitch'

interface Props {}

interface State {
    playlists: SpotifyPlaylist[]
    me: SpotifyMe
    playbackState: SpotifyPlaybackState
    mode: string
    playerActive: boolean
    vizActive: boolean
}

export class AppSpotify extends React.Component<Props, State> {
    state: State = {
        playlists: [],
        mode: 'index',
        playbackState: {} as SpotifyPlaybackState,
        me: {} as SpotifyMe,
        playerActive: true,
        vizActive: true,
    }

    componentDidMount() {
        const hash = document.location.hash.replace('#', '')
        this.setState({
            mode: hash || 'index',
        })
        this.initialize()
    }

    initialize() {
        ipcRenderer.on(SpotifyEvents.List, (_event, type, data) => {
            if (type === 'all') {
                this.setState({ playlists: [...data] })
            }
        })
        ipcRenderer.on(SpotifyEvents.Me, (_event, data: SpotifyMe) => {
            this.setState({ me: data })
        })
        ipcRenderer.on(SpotifyEvents.State, (_event, playbackState: SpotifyPlaybackState) => {
            this.setState({ playbackState })
        })

        ipcRenderer.on('WINDOW_SHOW', (_event, stateID) => {
            if (stateID === BrowserState.Player) {
                this.setState({ playerActive: true })
            }
            if (stateID === BrowserState.Visualizer) {
                this.setState({ vizActive: true })
            }
        })

        ipcRenderer.on('WINDOW_HIDE', (_event, stateID) => {
            if (stateID === BrowserState.Player) {
                this.setState({ playerActive: false })
            }
            if (stateID === BrowserState.Visualizer) {
                this.setState({ vizActive: false })
            }
        })

        setTimeout(() => {
            ipcRenderer.send(SpotifyEvents.SendMe)
            ipcRenderer.send(SpotifyEvents.SendList)
            ipcRenderer.send(SpotifyEvents.SendState)
        }, 1000)
    }

    renderSettings() {
        return (
            <PageSettings
                onApply={this.onApplySettings.bind(this)}
                onCancel={this.onCancelSettings.bind(this)}
                playlists={this.state.playlists}
                me={this.state.me}
            />
        )
    }

    renderServerError() {
        return <div style={{ color: 'red' }}>Spotify Auth Server is not responding. Check settings or setup one</div>
    }

    renderLoading() {
        return (
            <View padding="20px" horizontalAlignment="center" verticalAlignment="center" height={'355px'}>
                <ProgressCircle size={25} />
            </View>
        )
    }

    renderPlayer() {
        return this.state.playbackState ? (
            <PagePlayer
                playbackState={this.state.playbackState}
                updatePlaybackState={() => {
                    ipcRenderer.send(SpotifyEvents.SendState, true)
                }}
                active={this.state.playerActive}
                onPlayerAction={this.onPlayerAction.bind(this)}
            />
        ) : (
            this.renderLoading()
        )
    }

    onPlayerAction(action: PlayerAction, data?: any) {
        switch (action) {
            case PlayerAction.Pause:
                ipcRenderer.send(SpotifyEvents.Pause)
                break
            case PlayerAction.Play:
                ipcRenderer.send(SpotifyEvents.Play, data || undefined, data ? 'track' : undefined)
                break
            case PlayerAction.Next:
                ipcRenderer.send(SpotifyEvents.Next)
                break
            case PlayerAction.Prev:
                ipcRenderer.send(SpotifyEvents.Prev)
                break
            case PlayerAction.Rewind:
                ipcRenderer.send(SpotifyEvents.Rewind, data || 0)
                break
            case PlayerAction.ToggleShuffle:
                ipcRenderer.send(SpotifyEvents.ToggleShuffle)
                break
            case PlayerAction.ToggleRepeat:
                ipcRenderer.send(SpotifyEvents.ToggleRepeat)
                break
            case PlayerAction.PlayContextURI:
                ipcRenderer.send(SpotifyEvents.PlayContextURI, data || '')
                break
            case PlayerAction.PlayGenre:
                ipcRenderer.send(SpotifyEvents.PlayGenre, data || '')
                break
            default:
        }
        waitForTime(1000).then(() => ipcRenderer.send(SpotifyEvents.SendState, true))
    }

    onApplySettings() {
        ipcRenderer.send(SpotifyEvents.ApplySettings)
    }

    onCancelSettings() {
        ipcRenderer.send(SpotifyEvents.CancelSettings)
    }

    render() {
        if (!this.state.me.id) {
            return this.renderLoading()
        }
        return (
            <div className={styles()}>
                {this.state.mode === 'sandbox' && this.sandbox()}
                {this.state.mode === BrowserState.Settings && this.renderSettings()}
                {this.state.mode === 'SERVER_ERROR' && this.renderServerError()}
                {this.state.mode === BrowserState.Player && this.renderPlayer()}
                {this.state.mode === 'loading' && this.renderLoading()}
                {this.state.mode === BrowserState.Visualizer && this.renderVisualizer()}
            </div>
        )
    }

    renderVisualizer() {
        return <ThreeVisualizer vscene={new PitchScene()} active={this.state.vizActive} />
    }

    sandbox() {
        return <PageSandbox />
    }
}
