import { AppBrowserState, BrowserState, AppBrowserOptions } from '../../utils/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

import { isDev } from '../../main'
import { AppBrowserWindow } from '.'

export class AppBrowserStatePlayer implements AppBrowserState {
    stateId = BrowserState.Player
    browser: AppBrowserWindow

    config = {
        width: 500,
        height: 500,
        skipTaskbar: true,
        resizable: isDev,
        maximizable: isDev,
        minimizable: isDev,
        autoHideMenuBar: true,
        alwaysOnTop: true,
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
                this.win.hide()
            })
    }

    onExit() {
        this.win.hide()
    }

    onEnter(options?: AppBrowserOptions) {
        if (options && options.position) {
            this.win.setPosition(options.position.x, options.position.y, false)
        }
        this.browser.loadFile('index.html', { hash: 'PLAYER' })
        this.win.show()
    }

    auth(url: string) {
        this.browser.setState(BrowserState.Settings)
        this.browser.auth(url)
    }
}
