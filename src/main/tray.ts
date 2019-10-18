import { app, Tray, MenuItem, Menu, BrowserWindow, MenuItemConstructorOptions, Rectangle } from 'electron'
import { TRAY_ICON_FILE } from '../utils/const'
import { SpotifyPlaylists } from './playlists'
import { SpotifyPlaylist, SpotifyPlaybackState, Settings, SpotifyMe } from '../utils/types'

interface TrayOptions {
    onPlaylistClick: (list: SpotifyPlaylist) => void
    onSettings: () => void
    onLogout: () => void
    onShuffle: (checked: boolean) => void
    onRefresh: () => void
    onSkip: () => void
    onAddToPlaylist: (uri: string) => void
    onRightClick: (bounds: Rectangle) => void
    onLeftClick: () => void
    onQuit: () => void
}

const orderItemsBy = (order: string) => (a, b) => (order === 'name' ? (a.name > b.name ? 1 : -1) : 0)

export class AppTray {
    tray: Tray
    basename: string
    lists: SpotifyPlaylists
    contextMenu: Menu
    options: TrayOptions
    playbackState: SpotifyPlaybackState
    settings: Settings
    me: SpotifyMe
    mouseOver: boolean

    constructor(lists: SpotifyPlaylists, settings: Settings, me: SpotifyMe, options?: TrayOptions) {
        this.basename = app.getAppPath() + '/'
        this.me = me
        this.lists = lists
        this.settings = settings
        this.options = options || ({} as any)

        this.tray = new Tray(this.basename + TRAY_ICON_FILE)

        this.tray.setToolTip('Spotify Tray Pal')

        this.tray.on('click', (_event, _bounds, _position) => {
            this.options.onLeftClick()
            this.contextMenu && this.tray.popUpContextMenu(this.contextMenu)
        })

        this.tray.on('right-click', (_event, bounds) => {
            this.options.onRightClick(bounds)
        })

        this.tray.on('mouse-enter', () => {
            this.options.onRefresh()
            this.mouseOver = true
        })

        this.tray.on('mouse-leave', (a, b) => {
            this.mouseOver = false
        })

        this.playbackState = {
            context: {
                uri: '',
            },
        } as any

        this.refresh()
    }

    getCurrentTrackCaption() {
        let result = 'Nothing'
        if (!this.playbackState.context || !this.playbackState.item) {
            return result
        }
        const perc =
            this.playbackState.item.duration_ms > 0
                ? Math.round((this.playbackState.progress_ms / this.playbackState.item.duration_ms) * 100)
                : '?'
        result = `${this.playbackState.item.name} - ${this.playbackState.item.artists[0].name} - ${perc}% done`
        return result
    }

    refresh() {
        this.contextMenu = Menu.buildFromTemplate(
            ([
                { label: 'Playing: ' + this.getCurrentTrackCaption(), id: 'playing', type: 'normal', enabled: false },
                { type: 'separator' },
            ] as MenuItemConstructorOptions[]).concat(
                this.buildMenuItems(this.lists.getFavPlaylists(parseInt(this.settings.max_size), this.settings.order_recent_playlist))
                    .concat([{ type: 'separator' }])
                    .concat([
                        {
                            label: 'All Playlists',
                            submenu: Menu.buildFromTemplate(
                                this.buildMenuItems([...this.lists.all].sort(orderItemsBy(this.settings.order_playlists)), 'normal')
                            ),
                        },
                    ] as MenuItemConstructorOptions[])
                    .concat([
                        {
                            label: 'All Albums',
                            submenu: Menu.buildFromTemplate(
                                this.buildMenuItems(
                                    [...this.lists.albums].sort(orderItemsBy(this.settings.order_playlists)) as any[],
                                    'normal'
                                )
                            ),
                        },
                    ])
                    .concat([
                        {
                            label: 'Recent Albums',
                            submenu: Menu.buildFromTemplate(this.buildMenuItems(this.lists.recentAlbums as any[], 'normal')),
                        },
                        {
                            type: 'separator',
                        },
                        {
                            label: 'Skip',
                            click: () => this.options.onSkip(),
                        },
                        {
                            label:
                                this.playbackState && this.playbackState.item && this.settings.playlist
                                    ? `Add '${this.playbackState.item.name}' To '${this.lists.getDisplayNameById(this.settings.playlist)}'`
                                    : 'Add To Playlist',
                            enabled: this.playbackState && this.playbackState.item && this.settings.playlist ? true : false,
                            click: () => this.options.onAddToPlaylist(this.playbackState.item ? this.playbackState.item.uri : ''),
                        },
                        {
                            type: 'separator',
                        },
                        {
                            label: 'Shuffle',
                            type: 'checkbox',
                            click: event => {
                                this.options.onShuffle(event.checked || false)
                            },
                            checked: this.playbackState.shuffle_state ? true : false,
                        },
                    ])
                    .concat([
                        { type: 'separator' },
                        {
                            label: 'Settings',
                            click: () => {
                                this.options.onSettings && this.options.onSettings()
                            },
                        },
                        { type: 'separator' },
                        this.me && this.me.display_name
                            ? {
                                  label: `Logout (${this.me.display_name})`,
                                  click: () => {
                                      this.options.onLogout()
                                      this.me = {} as any
                                      this.lists.clear()
                                      this.refresh()
                                  },
                              }
                            : { label: 'Login' },
                        {
                            label: 'Quit Spotify Desktop Companion',
                            click: () => {
                                this.options.onQuit()
                            },
                        },
                    ])
            )
        )
        // this.tray.setContextMenu(this.contextMenu)
        this.tray.setToolTip(this.playbackState.context ? this.lists.getDisplayName(this.playbackState.context.uri) : 'Sptofiy is silent')
    }

    buildMenuItems(list: SpotifyPlaylist[], type: 'radio' | 'normal' = 'radio'): MenuItemConstructorOptions[] {
        const res: MenuItemConstructorOptions[] = list.map(one => {
            return {
                label: one.name,
                type: type,
                id: one.uri,
                checked: type === 'radio' && this.playbackState.context && one.uri === this.playbackState.context.uri ? true : undefined,
                click: _event => {
                    this.tray.setToolTip(`${one.name} - ${one.total_tracks || one.tracks.total} tracks`)
                    this.options.onPlaylistClick && this.options.onPlaylistClick(one)
                },
            }
        })
        return res
    }

    syncCurrentUri(uri: string) {
        if (this.playbackState.context) {
            this.playbackState.context.uri = uri
        }
    }

    syncState(state: SpotifyPlaybackState) {
        this.playbackState = Object.assign({}, state)
        this.refresh()
    }

    applySettings(settings: Settings) {
        this.settings = Object.assign({}, settings)
        this.refresh()
    }
}
