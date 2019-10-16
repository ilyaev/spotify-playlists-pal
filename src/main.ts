import { app } from 'electron'
import { AppWindow } from './main/window'
import { Settings } from './utils/types'

let appWindow: AppWindow
const isDev = process.argv.findIndex(arg => arg === 'dev') >= 0

const createWindow = () => {
    appWindow = new AppWindow({
        isDev,
        onChangeSettings: (settings: Settings) => {
            app.setLoginItemSettings({
                openAtLogin: isDev ? false : settings.lunch_at_login || false,
            })
        },
    })

    console.log('Electron App Started in Folder: ' + appWindow.basename)
}

app.setLoginItemSettings({ openAsHidden: true })
app.on('ready', createWindow)
