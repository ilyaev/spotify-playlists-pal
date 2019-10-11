import { app, Tray, MenuItem, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { TRAY_ICON_FILE } from '../utils/const'
import { SpotifyPlaylists } from './playlists'
import { SpotifyPlaylist } from '../utils/types'

interface TrayOptions {
    onPlaylistClick: (list: SpotifyPlaylist) => void
}

export class AppTray {
    tray: Tray
    basename: string
    win: BrowserWindow
    lists: SpotifyPlaylists
    contextMenu: Menu
    options: TrayOptions

    constructor(win: BrowserWindow, lists: SpotifyPlaylists, options?: TrayOptions) {
        this.basename = app.getAppPath() + '/'
        this.win = win
        this.lists = lists
        this.options = options || ({} as any)
        this.tray = new Tray(this.basename + TRAY_ICON_FILE)
        this.tray.setToolTip('Splotify Tray Pal')
    }

    refresh() {
        this.contextMenu = Menu.buildFromTemplate(
            this.buildMenuItems(this.lists.getFavPlaylists())
                .concat([{ type: 'separator' }])
                .concat([
                    {
                        label: 'All Playlists',
                        submenu: Menu.buildFromTemplate(this.buildMenuItems(this.lists.all))
                    }
                ] as MenuItemConstructorOptions[])
                .concat([{ type: 'separator' }, { label: 'Settings' }, { type: 'separator' }, { role: 'quit' }])
        )
        this.tray.setContextMenu(this.contextMenu)
    }

    buildMenuItems(list: SpotifyPlaylist[]): MenuItemConstructorOptions[] {
        return list.map(one => {
            return {
                label: one.name,
                type: 'radio',
                id: one.uri,
                click: _event => {
                    this.tray.setToolTip(`${one.name} - ${one.tracks.total} tracks`)
                    this.options.onPlaylistClick && this.options.onPlaylistClick(one)
                }
            }
        })
    }
}
