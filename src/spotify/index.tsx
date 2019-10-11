import * as React from 'react'
import { bem } from '../utils'
import { SpotifyPlaylist, SpotifyEvents } from '../utils/types'
import { ipcRenderer, ipcMain } from 'electron'

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
        mode: 'index'
    }

    componentDidMount() {
        this.initialize()
        ipcRenderer.send(SpotifyEvents.SendList)
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

    render() {
        return (
            <div className={styles()}>
                {this.state.mode === 'settings' ? (
                    this.renderSettings()
                ) : (
                    <div className={styles('list')}>
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
