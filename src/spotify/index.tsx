import * as React from 'react'
import { bem, waitForTime } from '../utils'
import { SpotifyPlaylist, SpotifyEvents, SpotifyMe, SpotifyPlaybackState, BrowserState, PlayerAction } from '../utils/types'
import { ipcRenderer } from 'electron'
import { ProgressCircle, View } from 'react-desktop/macOs'
import { PageSettings } from './settings'
import { PagePlayer } from './player'

const styles = bem('spotify')
import './index.less'

interface Props {}

interface State {
    playlists: SpotifyPlaylist[]
    me: SpotifyMe
    playbackState: SpotifyPlaybackState
    mode: string
}

export class AppSpotify extends React.Component<Props, State> {
    state: State = {
        playlists: [],
        mode: 'index',
        playbackState: {} as SpotifyPlaybackState,
        me: {} as SpotifyMe,
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
        return (
            <PagePlayer
                playbackState={this.state.playbackState}
                updatePlaybackState={() => {
                    ipcRenderer.send(SpotifyEvents.SendState, true)
                }}
                onPlayerAction={this.onPlayerAction.bind(this)}
            />
        )
    }

    onPlayerAction(action: PlayerAction) {
        switch (action) {
            case PlayerAction.Pause:
                ipcRenderer.send(SpotifyEvents.Pause)
                break
            case PlayerAction.Play:
                ipcRenderer.send(SpotifyEvents.Play)
                break
            case PlayerAction.Next:
                ipcRenderer.send(SpotifyEvents.Next)
                break
            case PlayerAction.Prev:
                ipcRenderer.send(SpotifyEvents.Prev)
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
                {this.state.mode === BrowserState.Settings && this.renderSettings()}
                {this.state.mode === 'SERVER_ERROR' && this.renderServerError()}
                {this.state.mode === BrowserState.Player && this.renderPlayer()}
                {this.state.mode === 'loading' && this.renderLoading()}
            </div>
        )
    }
}
