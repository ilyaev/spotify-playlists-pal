/* eslint-disable no-unused-vars */
import { app, powerMonitor } from 'electron'
import { AppWindow } from './main/index'
import { Settings } from './utils/types'

let appWindow: AppWindow
export const isDev = process.argv.findIndex(arg => arg === 'dev' || arg.indexOf('--remote-debugging-port') !== -1) >= 0

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
app.on('before-quit', e => {
    // console.log('BEFORE_QUIT', e.sender)
    appWindow.browser.tobeClosed = true
})
