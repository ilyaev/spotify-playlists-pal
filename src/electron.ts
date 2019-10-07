import { app, BrowserWindow, ipcMain, dialog, Menu, Tray } from 'electron'

function createWindow() {
    const basename = app.getAppPath() + '/'

    const tray = new Tray(basename + 'static/play-button-small.png')
    tray.setToolTip('Spotify Playlist TrayPal')

    let win = new BrowserWindow({
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

    ipcMain.on('SPOTIFY-LIST', (_event, list) => {
        win.hide()
        const contextMenu = Menu.buildFromTemplate(
            list
                .map(one => {
                    return {
                        label: one.name,
                        type: 'radio',
                        id: one.id,
                        click: _event => {
                            win.webContents.send('SPOTIFY-PLAY', one.uri)
                            tray.setToolTip(`one.name - ${one.tracks.total} tracks`)
                        }
                    }
                })
                .concat([{ type: 'separator' }, { role: 'quit' }])
        )
        tray.setContextMenu(contextMenu)
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
