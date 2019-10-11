import { BrowserWindow, app, ipcMain } from 'electron'
import {
    APP_WINDOW_HEIGHT,
    APP_WINDOW_WIDTH,
    SPOTIFY_AUTH_SCOPE,
    SPOTIFY_AUTH_STATE,
    SPOTIFY_CALLBACK_URL,
    SPOTIFY_TOKEN_SERVER
} from '../utils/const'
import { SpotifyAuth, SpotifyPlaybackState, SpotifyMe, SpotifyPlaylist, SpotifyEvents } from '../utils/types'
import { AppTray } from './tray'
import { SpotifyPlaylists } from './playlists'
import { spotifyApi } from '../utils/api'
import fetch from 'node-fetch'

const INSTANCE_ID = 'atz'

export class AppWindow {
    win: BrowserWindow
    basename: string
    tray: AppTray
    playlists: SpotifyPlaylists
    auth: SpotifyAuth
    me: SpotifyMe
    playbackState: SpotifyPlaybackState

    constructor() {
        this.basename = app.getAppPath() + '/'

        this.win = new BrowserWindow({
            width: APP_WINDOW_WIDTH,
            height: APP_WINDOW_HEIGHT,
            webPreferences: {
                nodeIntegration: true
            }
        })

        this.listenToEvents()

        this.listenToRedirects()

        this.playlists = new SpotifyPlaylists()
        this.tray = new AppTray(this.win, this.playlists, {
            onPlaylistClick: this.onPlaylistClick.bind(this)
        })

        this.devSetup()

        this.authSpotify()
    }

    listenToEvents() {
        ipcMain.on(SpotifyEvents.SendList, (_event, type) => {
            this.win.webContents.send(SpotifyEvents.List, type || 'all', this.playlists.all)
        })
    }

    onPlaylistClick(list: SpotifyPlaylist) {
        this.setItem('SPOTIFY_FAVORITES', JSON.stringify(this.playlists.addFavorite(list.uri)))

        this.tray.refresh()

        spotifyApi.play({
            context_uri: list.uri
        })
    }

    async initialize() {
        await this.syncPlaybackState()
        this.me = await spotifyApi.getMe().then(res => res.body)
        this.loadPlaylists()
    }

    async loadPlaylists() {
        const playlists = (await spotifyApi
            .getUserPlaylists(undefined, { limit: 50 })
            .then(res => res.body.items || [])) as SpotifyPlaylist[]

        const db = (await this.getItem('SPOTIFY_FAVORITES')) || '[]'

        const favorites = JSON.parse(db) as any[]
        this.playlists.sync(playlists, favorites)
        this.tray.refresh()
        this.win.webContents.send(SpotifyEvents.List, 'all', this.playlists.all)
    }

    async syncPlaybackState() {
        this.playbackState = (await spotifyApi.getMyCurrentPlaybackState().then(res => res.body)) as SpotifyPlaybackState
    }

    async authSpotify() {
        this.goIndex()
        const authRaw = await this.getItem('SPOTIFY_AUTH')
        this.auth = JSON.parse(authRaw || JSON.stringify({ access_token: '' }))

        if (this.auth.access_token) {
            await this.refreshToken()
            this.initialize()
        } else {
            this.goAuthSpotify()
        }
    }

    goAuthSpotify() {
        this.win.loadURL(spotifyApi.createAuthorizeURL(SPOTIFY_AUTH_SCOPE, SPOTIFY_AUTH_STATE))
    }

    listenToRedirects() {
        this.win.webContents.on('will-redirect', (event, newUrl) => {
            if (newUrl.indexOf(`${SPOTIFY_CALLBACK_URL}?code=`) !== -1) {
                event.preventDefault()
                const code = newUrl.split(`${SPOTIFY_CALLBACK_URL}?code=`)[1].split('&')[0]
                fetch(`${SPOTIFY_TOKEN_SERVER}auth?code=${code}&id=${INSTANCE_ID}`)
                    .then(res => res.json())
                    .then(body => {
                        if (!body.success) {
                            throw new Error('No')
                        } else {
                            this.goIndex()
                            this.syncAuth(body)
                            this.initialize()
                        }
                    })
            }
        })
    }

    goIndex() {
        this.win.loadFile('index.html')
    }

    async refreshToken() {
        if (!this.auth.access_token) {
            return Promise.resolve(false)
        }
        return await fetch(`${SPOTIFY_TOKEN_SERVER}refresh?id=${INSTANCE_ID}`)
            .then(res => res.json())
            .then(body => {
                if (!body.success) {
                    this.goAuthSpotify()
                } else {
                    this.syncAuth(body)
                }
            })
            .catch(_e => {
                this.goAuthSpotify()
            })
    }

    syncAuth(body: any) {
        spotifyApi.setAccessToken(body.access_token)
        this.auth.access_token = body.access_token
        this.setItem('SPOTIFY_AUTH', JSON.stringify(body))
    }

    devSetup() {
        const elemon = require('elemon')
        elemon({
            app: app,
            mainFile: 'electron.js',
            bws: [{ bw: this.win, res: ['bundle.js', 'index.html'] }]
        })
    }

    setItem(item: string, value: string) {
        this.win.webContents.executeJavaScript(`localStorage.setItem('${item}','${value}')`)
    }

    getItem(item: string) {
        return this.win.webContents.executeJavaScript(`localStorage.getItem('${item}')`)
    }
}
