import { AppBrowserState, BrowserState, AppBrowserOptions } from 'utils/types'
import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

import { isDev } from 'src/main'
import { AppBrowserWindow } from './index'

export class AppBrowserStateVisualizer implements AppBrowserState {
    stateId = BrowserState.Visualizer
    browser: AppBrowserWindow

    config = {
        width: 800,
        height: 600,
        skipTaskbar: true,
        resizable: isDev,
        maximizable: isDev,
        minimizable: isDev,
        autoHideMenuBar: true,
        show: false,
        backgroundColor: 'black',
        frame: isDev ? true : false,
        webPreferences: {
            nodeIntegration: true,
        },
    } as BrowserWindowConstructorOptions

    win: BrowserWindow

    constructor(browser: AppBrowserWindow) {
        this.browser = browser
        this.createWin()
    }

    onExit() {
        // if (this.win.isVisible()) {
        this.browser.send('WINDOW_HIDE', this.stateId)
        this.win.hide()
        // }
    }

    createWin() {
        if (this.win) {
            return
        }
        this.win = new BrowserWindow(this.config)

        isDev ||
            this.win.on('blur', () => {
                this.onExit()
            })
    }

    onEnter(options: AppBrowserOptions = { hash: '' }) {
        this.browser.loadFile('index.html', { hash: options!.hash || BrowserState.Visualizer })
        this.win.show()
        this.browser.send('WINDOW_SHOW', this.stateId)
        if (isDev) {
            // this.win.setSize(this.config.width + 600, this.config.height * 1.8)
            // this.win.webContents.openDevTools({ mode: 'bottom' })
            // this.win.setFullScreen(true)
            // this.win.setPosition(0, 0, false)
        } else {
            this.win.setFullScreen(true)
        }
    }

    auth(url: string) {
        this.browser.setState(BrowserState.Settings)
        this.browser.auth(url)
    }
}
