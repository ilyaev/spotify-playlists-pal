import { app } from 'electron'
import { AppWindow } from './main/window'

let appWindow: AppWindow

const createWindow = () => {
    appWindow = new AppWindow()
    console.log('Electron App Started in Folder: ' + appWindow.basename)
}

app.on('ready', createWindow)
