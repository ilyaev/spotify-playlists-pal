import { AppBrowserState, BrowserState, AppBrowserOptions } from '../../utils/types'
import { BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron'

import { isDev } from '../../main'
import { AppBrowserWindow } from './index'

export class AppBrowserStatePlayer implements AppBrowserState {
    stateId = BrowserState.Player
    browser: AppBrowserWindow

    config = {
        width: 340,
        height: 460,
        skipTaskbar: true,
        resizable: isDev,
        maximizable: isDev,
        minimizable: isDev,
        autoHideMenuBar: true,
        // alwaysOnTop: true,
        show: false,
        frame: isDev ? true : false,
        webPreferences: {
            nodeIntegration: true,
        },
    } as BrowserWindowConstructorOptions

    win: BrowserWindow

    constructor(browser: AppBrowserWindow) {
        this.browser = browser
        this.win = new BrowserWindow(this.config)

        isDev ||
            this.win.on('blur', () => {
                this.onExit()
            })
    }

    onExit() {
        this.browser.send('WINDOW_HIDE', this.stateId)
        this.win.hide()
    }

    onEnter(options: AppBrowserOptions = { hash: '' }) {
        if (options && options.position) {
            this.win.setPosition(options.position.x - Math.floor(this.config.width / 2) + 2, options.position.y, false)
        } else {
            this.browser.moveWindowToDebugScreen(this.win, this.config.width, this.config.height)
        }
        this.browser.loadFile('index.html', { hash: options!.hash || BrowserState.Player })
        this.win.show()
        this.browser.send('WINDOW_SHOW', this.stateId)
        if (isDev) {
            this.win.setSize(this.config.width + 600, this.config.height * 1.8)
            this.win.webContents.openDevTools({ mode: 'bottom' })
            this.win.setPosition(0, 0, false)
        }
    }

    auth(url: string) {
        this.browser.setState(BrowserState.Settings)
        this.browser.auth(url)
    }
}
