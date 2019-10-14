import * as React from 'react'
import { bem } from '../utils'
import { SpotifyPlaylist, SpotifyEvents } from '../utils/types'
import { ipcRenderer } from 'electron'
import { ProgressCircle } from 'react-desktop/macOs'
import { PageSettings } from './settings'

const styles = bem('spotify')
import './index.less'

interface Props {}

interface State {
    playlists: SpotifyPlaylist[]
    mode: string
}

export class AppSpotify extends React.Component<Props, State> {
    state: State = {
        playlists: [],
        mode: 'index',
    }

    componentDidMount() {
        this.initialize()
        ipcRenderer.send(SpotifyEvents.SendList)
        const hash = document.location.hash.replace('#', '')
        this.setState({
            mode: hash || 'index',
        })
    }

    initialize() {
        ipcRenderer.on(SpotifyEvents.List, (_event, type, data) => {
            if (type === 'all') {
                this.setState({ playlists: [...data] })
            }
        })
    }

    onListClick(list: SpotifyPlaylist) {
        console.log('Click', list)
    }

    renderSettings() {
        return <div>Settings Here!</div>
    }

    renderServerError() {
        return <div style={{ color: 'red' }}>Spotify Auth Server is not responding. Check settings or setup one</div>
    }

    renderLoading() {
        return (
            <div style={{ padding: '50px', justifyContent: 'center' }}>
                <ProgressCircle size={25} />
            </div>
        )
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
                {this.state.mode === 'settings' && (
                    <PageSettings onApply={this.onApplySettings.bind(this)} onCancel={this.onCancelSettings.bind(this)} />
                )}
                {this.state.mode === 'SERVER_ERROR' && this.renderServerError()}
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
