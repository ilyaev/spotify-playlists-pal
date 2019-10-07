import * as React from 'react'
import { bem } from '../utils'
import { ipcRenderer } from 'electron'
import { SPOTIFY_CLIENT_ID } from '../env'

let SpotifyWebApi = require('spotify-web-api-node')
let spotifyApi

const styles = bem('spotify')
import './index.less'

interface Props {}

interface SpotfyPlaylist {
    id: string
    name: string
    uri: string
    images: { url: string }[]
    tracks: { total: number; href: string }[]
}

interface State {
    playlists: SpotfyPlaylist[]
}

export class AppSpotify extends React.Component<Props, State> {
    state: State = {
        playlists: []
    }

    componentDidMount() {
        spotifyApi = new SpotifyWebApi({
            clientId: SPOTIFY_CLIENT_ID,
            redirectUri: 'http://127.0.0.1/'
        })

        var scopes = ['user-read-private', 'user-read-email', 'playlist-read-private', 'streaming']
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
        const playlists = (await spotifyApi
            .getUserPlaylists(undefined, { limit: 50 })
            .then(res => res.body.items || [])) as SpotfyPlaylist[]
        this.setState({ playlists: playlists.sort((a, b) => (a.name < b.name ? -1 : 1)) })
        ipcRenderer.send('SPOTIFY-LIST', playlists)
        ipcRenderer.on('SPOTIFY-PLAY', (event, uri) => {
            spotifyApi.play({
                context_uri: uri
            })
        })
    }

    onListClick(list: SpotfyPlaylist) {
        spotifyApi.play({
            context_uri: list.uri
        })
    }

    render() {
        return (
            <div className={styles()}>
                <div className={styles('list')}>
                    {this.state.playlists.map(list => {
                        return (
                            <div key={`id${list.id}`} onClick={() => this.onListClick(list)} className={styles('link')}>
                                {list.name}
                                {/* <img src={list.images[0].url} width={50} height={50} /> */}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}
