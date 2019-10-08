import * as React from 'react'
import { bem } from '../utils'
import { ipcRenderer } from 'electron'
import { SPOTIFY_CLIENT_ID } from '../env'
import { SpotfyPlaylist, SpotifyPlaybackState } from '../types'

let SpotifyWebApi = require('spotify-web-api-node')
let spotifyApi

const styles = bem('spotify')
import './index.less'

interface Props {}

interface State {
    playlists: SpotfyPlaylist[]
    mode: string
}

export class AppSpotify extends React.Component<Props, State> {
    state: State = {
        playlists: [],
        mode: 'index'
    }

    componentDidMount() {
        spotifyApi = new SpotifyWebApi({
            clientId: SPOTIFY_CLIENT_ID,
            redirectUri: 'http://127.0.0.1/'
        })

        var scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'streaming',
            'user-read-playback-state',
            'user-read-currently-playing'
        ]
        const state = 'supercharge'

        if (document.location.hash) {
            const authToken = document.location.hash.replace('#', '').split('&')[0]
            spotifyApi.setAccessToken(authToken)
            this.initialize()
        } else {
            var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state).replace('response_type=code', 'response_type=token')
            document.location.href = authorizeURL
        }
    }

    async initialize() {
        console.log(spotifyApi)
        const playlists = (await spotifyApi
            .getUserPlaylists(undefined, { limit: 50 })
            .then(res => res.body.items || [])) as SpotfyPlaylist[]

        this.setState({ playlists: playlists.sort((a, b) => (a.name < b.name ? -1 : 1)) })

        ipcRenderer.send('SPOTIFY-LIST', playlists)

        ipcRenderer.on('SPOTIFY-PLAY', (_event, uri) => {
            spotifyApi.play({
                context_uri: uri
            })
        })

        ipcRenderer.on('SPOTIFY-SETTINGS', _event => {
            this.setState({
                mode: 'settings'
            })
        })

        const myState = (await spotifyApi.getMyCurrentPlaybackState().then(res => res.body)) as SpotifyPlaybackState
        ipcRenderer.send('SPOTIFY-STATE', myState)

        console.log(myState)

        const me = await spotifyApi.getMe().then(res => res.body)
        console.log(me)
    }

    onListClick(list: SpotfyPlaylist) {
        spotifyApi.play({
            context_uri: list.uri
        })
        ipcRenderer.send('SPOTIFY-SYNCMENU', list.uri)
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
