/* eslint-disable no-unused-vars */
import { AppBrowserState, BrowserState, AppBrowserOptions } from 'utils/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

import { isDev } from 'src/main'
import { AppBrowserWindow } from './index'
import { waitForTime } from 'utils/index'

export class AppBrowserStateSandbox implements AppBrowserState {
    stateId = BrowserState.Sandbox
    browser: AppBrowserWindow

    config = {
        width: 1350,
        height: 800,
        skipTaskbar: true,
        resizable: isDev,
        maximizable: isDev,
        minimizable: isDev,
        autoHideMenuBar: true,
        // alwaysOnTop: isDev,
        show: false,
        backgroundColor: 'black',
        frame: isDev ? true : false,
        webPreferences: {
            nodeIntegration: true,
        },
    } as BrowserWindowConstructorOptions

    win: BrowserWindow = null

    constructor(browser: AppBrowserWindow) {
        this.browser = browser
        this.createWin()
    }

    onExit(hideFullScreen: boolean = false) {
        if (!this.win || this.win.isDestroyed()) {
            return
        }
        if (!hideFullScreen && this.win.isFullScreen()) {
            return
        }
        this.browser.send('WINDOW_HIDE', this.stateId)
        this.win.hide()
        this.win.destroy()
        this.win = null
    }

    createWin() {
        if (this.win && !this.win.isDestroyed()) {
            return
        }

        this.win = new BrowserWindow(this.config)
        this.browser.sync(this.win)

        isDev ||
            this.win.on('blur', () => {
                this.onExit()
            })
    }

    onEnter(options: AppBrowserOptions = { hash: '' }) {
        this.createWin()
        this.browser.loadFile('index.html', { hash: options!.hash || BrowserState.Sandbox })
        this.win.webContents.executeJavaScript('window.document.body.style.backgroundColor = "black"')
        this.win.show()
        this.browser.send('WINDOW_SHOW', this.stateId)
        if (isDev) {
            this.win.setSize(this.config.width, this.config.height)
            this.win.webContents.openDevTools({ mode: 'right' })
            this.browser.moveWindowToDebugScreen(this.win, this.config.width, this.config.height)
        } else {
            this.win.setFullScreen(true)
        }
    }

    auth(url: string) {
        this.browser.setState(BrowserState.Settings)
        this.browser.auth(url)
    }
}
