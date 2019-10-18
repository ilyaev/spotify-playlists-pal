import { AppBrowserState, BrowserState } from '../../utils/types'
import { BrowserWindow, BrowserViewConstructorOptions, BrowserWindowConstructorOptions } from 'electron'
import { APP_WINDOW_HEIGHT, APP_WINDOW_WIDTH } from '../../utils/const'

import { isDev } from '../../main'
import { AppBrowserWindow } from '.'

export class AppBrowserStateSettings implements AppBrowserState {
    stateId = BrowserState.Settings
    browser: AppBrowserWindow

    config = {
        width: APP_WINDOW_WIDTH,
        height: APP_WINDOW_HEIGHT,
        skipTaskbar: true,
        resizable: isDev,
        maximizable: isDev,
        minimizable: isDev,
        autoHideMenuBar: true,
        show: false,
        frame: true,
        webPreferences: {
            nodeIntegration: true,
        },
    } as BrowserWindowConstructorOptions

    win: BrowserWindow

    constructor(browser: AppBrowserWindow) {
        this.browser = browser
        this.win = new BrowserWindow(this.config)
    }

    onExit() {
        this.win.hide()
    }

    onEnter() {
        this.browser.loadFile('index.html', { hash: 'settings' })
        this.win.show()
    }

    auth(url: string) {
        this.win.show()
        this.browser.loadURL(url)
        this.win.setSize(800, 600)
        this.win.show()
    }
}
