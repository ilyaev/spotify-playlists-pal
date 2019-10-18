import * as React from 'react'
import { bem } from '../utils'
import { SpotifyPlaylist, SpotifyEvents, SpotifyMe, SpotifyPlaybackState } from '../utils/types'
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

    onListClick(list: SpotifyPlaylist) {
        console.log('Click', list)
    }

    renderSettings() {
        if (!this.state.me.id) {
            return this.renderLoading()
        }
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
        return <PagePlayer playbackState={this.state.playbackState} />
    }

    onApplySettings() {
        ipcRenderer.send(SpotifyEvents.ApplySettings)
    }

    onCancelSettings() {
        ipcRenderer.send(SpotifyEvents.CancelSettings)
    }

    render() {
        return (
            <div className={styles()}>
                {this.state.mode === 'settings' && this.renderSettings()}
                {this.state.mode === 'SERVER_ERROR' && this.renderServerError()}
                {this.state.mode === 'PLAYER' && this.renderPlayer()}
                {this.state.mode === 'loading' && this.renderLoading()}
                {this.state.mode === 'index' && (
                    <div className={styles('list')}>
                        {this.state.playlists.length <= 0 && <div>Loading...</div>}
                        {this.state.playlists.map(list => {
                            return (
                                <div key={`id${list.id}`} onClick={() => this.onListClick(list)} className={styles('link')}>
                                    {list.name}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }
}
