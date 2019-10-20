import { app, ipcMain, LoadFileOptions, Rectangle, Event } from 'electron'
import {
    APP_WINDOW_HEIGHT,
    APP_WINDOW_WIDTH,
    SPOTIFY_AUTH_SCOPE,
    SPOTIFY_AUTH_STATE,
    SPOTIFY_CALLBACK_URL,
    SPOTIFY_TOKEN_SERVER,
    SETTINGS_STORAGE_KEY,
    SETTINGS_DEFAULTS,
    INSTANCE_ID_STORAGE_KEY,
    SPOTIFY_TOKEN_REFRESH_INTERVAL,
} from '../utils/const'
import {
    SpotifyAuth,
    SpotifyPlaybackState,
    SpotifyMe,
    SpotifyPlaylist,
    SpotifyEvents,
    SpotifyRecentItem,
    SpotifyAlbum,
    Settings,
    SpotifyFavoriteList,
    BrowserState,
    AppBrowserOptions,
} from '../utils/types'
import { AppTray } from './tray'
import { SpotifyPlaylists } from './playlists'
import { spotifyApi, spotifyMac } from '../utils/api'
import { normalizeSpotifyURI, waitForTime } from '../utils'
import { AppBrowserWindow } from './browser/index'
import fetch from 'node-fetch'
import { isDev } from '../main'

let INSTANCE_ID = 'atz'

interface AppOptions {
    isDev: boolean
    onChangeSettings: (settings: Settings) => void
}

export class AppWindow {
    browser: AppBrowserWindow
    basename: string
    tray: AppTray
    playlists: SpotifyPlaylists
    auth: SpotifyAuth
    me: SpotifyMe = {} as SpotifyMe
    playbackState: SpotifyPlaybackState
    options: AppOptions
    refreshId: any

    constructor(options: AppOptions) {
        this.options = options
        this.basename = app.getAppPath() + '/'

        this.browser = new AppBrowserWindow({
            onWillRedirect: this.onWillRedirect.bind(this),
        })

        this.playlists = new SpotifyPlaylists()

        this.listenToEvents()
        this.listenToRedirects()
        this.setupTokenAutoRefresh()

        this.devSetup()

        waitForTime(1000).then(this.authSpotify.bind(this))
    }

    async initialize() {
        await this.loadMe()
        await this.loadPlaylists()
        await this.syncPlaybackState()
        isDev && this.showMiniPlayer()
    }

    listenToEvents() {
        ipcMain.on(SpotifyEvents.SendList, (_event, type) => {
            this.browser.send(SpotifyEvents.List, type || 'all', this.playlists.all)
        })

        ipcMain.on(SpotifyEvents.SendState, (_event, refresh: boolean = false) => {
            if (refresh) {
                this.syncPlaybackState()
            } else {
                this.playbackState && this.browser.send(SpotifyEvents.State, this.playbackState)
            }
        })

        ipcMain.on(SpotifyEvents.SendMe, async () => {
            await this.loadMe()
            this.browser.send(SpotifyEvents.Me, this.me)
        })

        ipcMain.on(SpotifyEvents.ApplySettings, async _event => {
            const settings = JSON.parse(await this.loadItem(SETTINGS_STORAGE_KEY)) as Settings
            this.tray.applySettings(settings)
            this.options.onChangeSettings(settings)
            this.browser.win.hide()
        })

        ipcMain.on(SpotifyEvents.CancelSettings, _event => {
            this.browser.win.hide()
        })

        ipcMain.on(SpotifyEvents.Pause, () => {
            spotifyApi.pause()
        })

        ipcMain.on(SpotifyEvents.Play, (_event, uri?: string) => {
            spotifyApi.play(
                uri
                    ? {
                          context_uri: uri,
                      }
                    : undefined
            )
        })

        ipcMain.on(SpotifyEvents.Next, () => {
            this.onSkip()
        })

        ipcMain.on(SpotifyEvents.Prev, () => {
            spotifyApi.skipToPrevious()
        })

        ipcMain.on(SpotifyEvents.Rewind, (_event, newPosition) => {
            spotifyApi.seek(newPosition)
        })

        ipcMain.on('DEBUG', (event, data) => {
            console.log('DEBUG: ', data)
        })
    }

    async listenToRedirects() {
        INSTANCE_ID = await this.generateInstanceId()
    }

    async authSpotify() {
        this.goSettings({ hash: BrowserState.Settings, hidden: true })
        const authRaw = await this.loadItem('SPOTIFY_AUTH')
        this.auth = JSON.parse(authRaw || JSON.stringify({ access_token: '' }))
        if (this.auth.access_token) {
            await this.refreshToken()
        } else {
            this.goAuthSpotify()
        }
    }

    goAuthSpotify() {
        this.browser.auth(spotifyApi.createAuthorizeURL(SPOTIFY_AUTH_SCOPE, SPOTIFY_AUTH_STATE))
    }

    async refreshToken(intialize: boolean = true) {
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
                    intialize && this.initialize()
                }
            })
            .catch(_e => {
                this.goSettings({ hash: 'SERVER_ERROR' })
            })
    }

    async onWillRedirect(event: Event, newUrl: string) {
        if (newUrl.indexOf(`${SPOTIFY_CALLBACK_URL}?code=`) !== -1) {
            event.preventDefault()
            const code = newUrl.split(`${SPOTIFY_CALLBACK_URL}?code=`)[1].split('&')[0]
            fetch(`${SPOTIFY_TOKEN_SERVER}auth?code=${code}&id=${INSTANCE_ID}`)
                .then(res => res.json())
                .then(body => {
                    if (!body.success) {
                        this.goSettings({ hash: 'SERVER_ERROR' })
                    } else {
                        this.browser.win.hide()
                        this.browser.win.setSize(APP_WINDOW_WIDTH, APP_WINDOW_HEIGHT)
                        this.goSettings({ hash: BrowserState.Settings })
                        this.syncAuth(body)
                        this.initialize()
                    }
                })
                .catch(_e => {
                    this.goSettings({ hash: 'SERVER_ERROR' })
                })
        }
    }

    setupTokenAutoRefresh() {
        this.refreshId = setTimeout(async () => {
            if (this.auth.access_token) {
                await this.refreshToken()
            }
            this.setupTokenAutoRefresh()
        }, SPOTIFY_TOKEN_REFRESH_INTERVAL)
    }

    onSkip() {
        spotifyApi.skipToNext()
    }

    async onAddToPlaylaylist(uri: string) {
        const settings = JSON.parse(await this.loadItem(SETTINGS_STORAGE_KEY)) as Settings
        if (uri && settings.playlist) {
            if (!(await this.playlists.isTrackInPlaylist(settings.playlist, uri))) {
                await spotifyApi.addTracksToPlaylist(settings.playlist, [uri])
            }
        }
    }

    async onLogout() {
        await this.storeItem('SPOTIFY_AUTH', '')
        this.me = {} as SpotifyMe
        this.authSpotify()
    }

    async onTrayRefresh() {
        return await this.syncPlaybackState()
    }

    async onShuffle(checked: boolean) {
        return await spotifyApi.setShuffle({ state: checked })
    }

    async onPlaylistClick(list: SpotifyPlaylist) {
        this.saveFavorites(this.playlists.addFavorite(list.uri))

        this.tray.syncCurrentUri(list.uri)
        this.tray.refresh()

        if (!this.playbackState.context) {
            spotifyMac.playTrack(list.uri)
        } else {
            spotifyApi.play({
                context_uri: list.uri,
            })
        }
    }

    async loadMe() {
        if (!this.me.id) {
            this.me = await spotifyApi.getMe().then(res => res.body)
        }
        return this.me
    }

    async loadPlaylists() {
        const [playlists, recent, albums] = await Promise.all([
            spotifyApi
                .getUserPlaylists(undefined, { limit: 50 })
                .then(res => res.body.items || [])
                .catch(_e => []) as Promise<SpotifyPlaylist[]>,
            spotifyApi
                .getMyRecentlyPlayedTracks({ limit: 50 })
                .then(res => res.body.items || [])
                .catch(_e => []) as Promise<SpotifyRecentItem[]>,
            spotifyApi
                .getMySavedAlbums({ limit: 50 })
                .then(res => res.body.items.map(one => one.album))
                .catch(_e => []) as Promise<SpotifyAlbum[]>,
        ])

        const db = (await this.loadItem('SPOTIFY_FAVORITES')) || '[]'

        const favorites = JSON.parse(db) as any[]

        this.playlists.sync(playlists, favorites, recent, albums)

        if (!this.tray) {
            this.initTray()
        } else {
            this.tray.me = this.me
        }

        this.browser.send(SpotifyEvents.List, 'all', this.playlists.all)
    }

    async initTray() {
        const settingsRaw = (await this.loadItem(SETTINGS_STORAGE_KEY)) || JSON.stringify(SETTINGS_DEFAULTS)
        const settings = JSON.parse(settingsRaw) as Settings

        this.options.onChangeSettings(settings)

        this.tray = new AppTray(this.playlists, settings, this.me, {
            onPlaylistClick: this.onPlaylistClick.bind(this),
            onSettings: this.goSettings.bind(this),
            onLogout: this.onLogout.bind(this),
            onShuffle: this.onShuffle.bind(this),
            onRefresh: this.onTrayRefresh.bind(this),
            onSkip: this.onSkip.bind(this),
            onAddToPlaylist: this.onAddToPlaylaylist.bind(this),
            onRightClick: this.showMiniPlayer.bind(this),
            onLeftClick: () => this.browser.hide(),
            onQuit: () => this.browser.closeAll(),
        })

        this.tray.refresh()
        this.browser.tray = this.tray
    }

    async syncPlaybackState() {
        this.playbackState = (await spotifyApi.getMyCurrentPlaybackState().then(res => res.body)) as SpotifyPlaybackState
        if (this.playbackState.context && this.playbackState.context.uri) {
            this.playbackState.originContextUri = '' + this.playbackState.context.uri
            this.playbackState.context.uri = normalizeSpotifyURI(this.playbackState.context.uri)
        }
        if (this.playbackState.is_playing && this.playbackState.context) {
            this.saveFavorites(
                this.playlists.addFavorite(
                    this.playbackState.context.uri,
                    this.tray.playbackState.context && this.tray.playbackState.context.uri === this.playbackState.context.uri ? 0 : 1
                )
            )
        }
        this.tray.syncState(this.playbackState)
        this.browser.send(SpotifyEvents.State, this.playbackState)
        return this.playbackState
    }

    async generateInstanceId() {
        let id = (await this.loadItem(INSTANCE_ID_STORAGE_KEY)) || ''
        const its = id.split('-s-')
        if (!id || its.length === 1 || parseInt(its[1]) !== SPOTIFY_AUTH_SCOPE.length) {
            id = 'spotify-pal-' + Math.round(10000 + Math.random() * 100000) + '-s-' + SPOTIFY_AUTH_SCOPE.length
            this.storeItem(INSTANCE_ID_STORAGE_KEY, id)
        }
        return id
    }

    goSettings(options: AppBrowserOptions = { hash: BrowserState.Settings }) {
        this.browser.setState(BrowserState.Settings, options)
    }

    syncAuth(body: any) {
        spotifyApi.setAccessToken(body.access_token)
        this.auth.access_token = body.access_token
        this.storeItem('SPOTIFY_AUTH', JSON.stringify(body))
    }

    async devSetup() {
        if (!this.options.isDev || process.argv.findIndex(arg => arg.indexOf('--remote-debugging-port') !== -1) >= 0) {
            return
        }

        const elemon = require('elemon')

        elemon({
            app: app,
            mainFile: 'main.js',
            bws: this.browser.states.map(one => {
                return { bw: one.win, res: ['bundle.js', 'index.html'] }
            }),
        })
    }

    storeItem(item: string, value: string) {
        this.browser.storeItem(item, value)
    }

    loadItem(item: string) {
        return this.browser.loadItem(item)
    }

    saveFavorites(favs: SpotifyFavoriteList[]) {
        this.storeItem('SPOTIFY_FAVORITES', JSON.stringify(favs))
    }

    showMiniPlayer(trayBounds?: Rectangle) {
        this.browser.setState(BrowserState.Player, trayBounds ? { position: { x: trayBounds.x, y: trayBounds.y + 20 } } : {})
    }
}
