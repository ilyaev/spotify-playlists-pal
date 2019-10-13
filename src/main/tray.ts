import { app, Tray, MenuItem, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { TRAY_ICON_FILE } from '../utils/const'
import { SpotifyPlaylists } from './playlists'
import { SpotifyPlaylist, SpotifyPlaybackState, Settings } from '../utils/types'

interface TrayOptions {
    onPlaylistClick: (list: SpotifyPlaylist) => void
    onSettings: () => void
}

const orderItemsBy = order => (a, b) => (order === 'name' ? (a.name > b.name ? 1 : -1) : 0)

export class AppTray {
    tray: Tray
    basename: string
    win: BrowserWindow
    lists: SpotifyPlaylists
    contextMenu: Menu
    options: TrayOptions
    playbackState: SpotifyPlaybackState
    settings: Settings

    constructor(win: BrowserWindow, lists: SpotifyPlaylists, settings: Settings, options?: TrayOptions) {
        this.basename = app.getAppPath() + '/'
        this.win = win
        this.lists = lists
        this.settings = settings
        this.options = options || ({} as any)
        this.tray = new Tray(this.basename + TRAY_ICON_FILE)
        this.tray.setToolTip('Splotify Tray Pal')
        this.playbackState = {
            context: {
                uri: '',
            },
        } as any
        this.refresh()
    }

    refresh() {
        this.contextMenu = Menu.buildFromTemplate(
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
                            this.buildMenuItems([...this.lists.albums].sort(orderItemsBy(this.settings.order_playlists)) as any[], 'normal')
                        ),
                    },
                ])
                .concat([
                    {
                        label: 'Recent Albums',
                        submenu: Menu.buildFromTemplate(this.buildMenuItems(this.lists.recentAlbums as any[], 'normal')),
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
                    {
                        label: 'Quit',
                        click: () => {
                            this.win.close()
                        },
                    },
                ])
        )
        this.tray.setContextMenu(this.contextMenu)
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
