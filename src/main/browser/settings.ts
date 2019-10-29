import { AppBrowserState, BrowserState, AppBrowserOptions } from '../../utils/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
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
        this.browser.sync(this.win)

        isDev ||
            this.win.on('blur', () => {
                this.onExit()
            })
    }

    onExit() {
        // if (this.win.isVisible()) {
        this.browser.send('WINDOW_HIDE', this.stateId)
        this.win.hide()
        // }
    }

    onEnter(options: AppBrowserOptions = { hash: '' }) {
        this.browser.loadFile('index.html', { hash: options!.hash || BrowserState.Settings })
        if (options && options.hidden) {
            this.win.hide()
        } else {
            this.win.show()
        }
        isDev && this.browser.moveWindowToDebugScreen(this.win, this.config.width, this.config.height)
    }

    auth(url: string) {
        this.win.show()
        this.browser.loadURL(url)
        this.win.setSize(800, 600)
        this.win.show()
    }
}
