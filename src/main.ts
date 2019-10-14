import { app } from 'electron'
import { AppWindow } from './main/window'

let appWindow: AppWindow

const createWindow = () => {
    const isDev = process.argv.findIndex(arg => arg === 'dev') >= 0
    appWindow = new AppWindow({ isDev })
    console.log('Electron App Started in Folder: ' + appWindow.basename)
}

app.on('ready', createWindow)
