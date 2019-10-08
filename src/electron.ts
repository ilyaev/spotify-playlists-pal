import { app, BrowserWindow, ipcMain, Menu, Tray, MenuItemConstructorOptions } from 'electron'
import { SpotfyPlaylist, SpotifyPlaybackState } from './types'

let contextMenu: Menu
let tray: Tray
let win: BrowserWindow
let playlists: SpotfyPlaylist[]

function createWindow() {
    const basename = app.getAppPath() + '/'

    tray = new Tray(basename + 'static/play-button-small.png')
    tray.setToolTip('Spotify Playlist TrayPal')

    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })

    win.webContents.on('will-redirect', (event, newUrl) => {
        if (newUrl.indexOf('http://127.0.0.1/#access_token=') !== -1) {
            event.preventDefault()
            win.loadFile('index.html', { hash: newUrl.split('http://127.0.0.1/#access_token=')[1] })
        }
    })

    ipcMain.on('SPOTIFY-LIST', (_event, list: SpotfyPlaylist[]) => {
        win.hide()
        playlists = [...list]
        contextMenu = Menu.buildFromTemplate([{ label: 'All Playlists', submenu: Menu.buildFromTemplate(buildMenuItems(list)) }])
        tray.setContextMenu(contextMenu)
    })

    ipcMain.on('SPOTIFY-STATE', (_event, state: SpotifyPlaybackState) => {
        syncMenuWithPlaylist(state.context.uri)
    })

    ipcMain.on('SPOTIFY-SYNCMENU', (_event, uri: string) => {
        syncMenuWithPlaylist(uri)
    })

    win.loadFile('index.html')

    const elemon = require('elemon')

    elemon({
        app: app,
        mainFile: 'electron.js',
        bws: [{ bw: win, res: ['bundle.js', 'index.html'] }]
    })
}

app.on('ready', createWindow)

const syncMenuWithPlaylist = async (uri: string) => {
    const itemIndex = playlists.findIndex(item => item.uri === uri)
    if (itemIndex >= 0) {
        const db = (await localStorage.getItem('SPOTIFY_FAVORITES')) || '[]'
        let favorites = JSON.parse(db) as any[]
        const index = favorites.findIndex(item => item.uri === uri)
        if (index >= 0) {
            favorites[index] = Object.assign({}, favorites[index], {
                count: favorites[index].count + 1,
                ts: new Date()
            })
        } else {
            favorites = favorites.slice(0, 10)
            favorites.push({
                uri: uri,
                count: 0,
                ts: new Date()
            })
        }
        localStorage.setItem('SPOTIFY_FAVORITES', JSON.stringify(favorites.sort((a, b) => (a.count > b.count ? -1 : 1))))
        contextMenu = Menu.buildFromTemplate(
            buildMenuItems(getFavPlaylists(favorites))
                .concat([{ type: 'separator' }])
                .concat([
                    {
                        label: 'All Playlists',
                        submenu: Menu.buildFromTemplate(buildMenuItems(playlists))
                    }
                ] as MenuItemConstructorOptions[])
                .concat([
                    { type: 'separator' },
                    { label: 'Settings', click: _event => onSettings() },
                    { type: 'separator' },
                    { role: 'quit' }
                ])
        )
        tray.setContextMenu(contextMenu)
        const menuIndex = contextMenu.items.findIndex(item => item.id === uri)
        if (menuIndex >= 0) {
            contextMenu.items[menuIndex].checked = true
        }
    }
}

const onSettings = () => {
    win.webContents.send('SPOTIFY-SETTINGS', true)
    win.show()
}

const getPlaylists = (uris: string[]): SpotfyPlaylist[] => {
    return playlists.filter(item => (uris.indexOf(item.uri) !== -1 ? true : false))
}

const getFavPlaylists = (favorites: any[]): SpotfyPlaylist[] => {
    const list = getPlaylists(favorites.map(item => item.uri))

    return favorites.map(item => list.find(one => one.uri === item.uri))
}

const buildMenuItems = (list: SpotfyPlaylist[]): MenuItemConstructorOptions[] => {
    return list.map(one => {
        return {
            label: one.name,
            type: 'radio',
            id: one.uri,
            click: _event => {
                win.webContents.send('SPOTIFY-PLAY', one.uri)
                tray.setToolTip(`${one.name} - ${one.tracks.total} tracks`)
                syncMenuWithPlaylist(one.uri)
            }
        }
    })
}

const localStorage = {
    setItem: (item: string, value: string) => {
        win.webContents.executeJavaScript(`localStorage.setItem('${item}','${value}')`)
    },
    getItem: (item: string) => {
        return win.webContents.executeJavaScript(`localStorage.getItem('${item}')`)
    }
}
