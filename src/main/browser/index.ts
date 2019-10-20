import { BrowserWindow, LoadFileOptions, app, Event, screen as EScreen } from 'electron'
import { BrowserState, AppBrowserOptions } from '../../utils/types'
import { AppBrowserStateSettings } from './settings'
import { AppBrowserStatePlayer } from './player'
import { AppBrowserState } from '../../utils/types'
import { isDev } from '../../main'
import { AppTray } from '../tray'

interface Options {
    onWillRedirect: (event: Event, newUrl: string) => void
}

export class AppBrowserWindow {
    states: AppBrowserState[] = []
    state: AppBrowserState
    win: BrowserWindow
    tray: AppTray = undefined
    tobeClosed: boolean = false
    options: Options

    constructor(options: Options) {
        this.options = options
        this.initStates()
        this.setState(BrowserState.Settings, { hidden: true })
    }

    initStates() {
        this.states.push(new AppBrowserStateSettings(this))
        this.states.push(new AppBrowserStatePlayer(this))
        this.states.forEach(state => {
            state.win.on('close', event => {
                if (isDev) {
                    app.quit()
                } else {
                    if (this.tray && !this.tobeClosed) {
                        event.preventDefault()
                        state.win.hide()
                    }
                }
            })
            state.win.webContents.on('will-redirect', this.options.onWillRedirect)
        })
    }

    show() {
        this.state.win && this.state.win.show()
    }

    hide() {
        if (this.state.win) {
            this.send('WINDOW_HIDE', this.state.stateId)
            this.state.win.hide()
        }
    }

    getWin() {
        return this.state.win
    }

    setState(newState: BrowserState, options?: AppBrowserOptions) {
        const state = this.states.find(one => one.stateId === newState)

        if (!state) {
            return
        }

        if (this.state && this.state.stateId === newState) {
            this.state.onEnter(options, true)
            return
        }

        if (this.state) {
            this.state.onExit()
        }

        this.state = state
        this.state.onEnter(options)
        this.win = this.state.win
    }

    auth(url: string) {
        this.state.auth(url)
    }

    loadFile(path: string, options?: LoadFileOptions) {
        console.log('Load File: ', this.state.stateId, path, options)
        if (this.state.win) {
            if (options && options.hash && this.state.win.webContents.getURL().indexOf(`#${options.hash}`) !== -1) {
                console.log('Skipped')
            } else {
                this.state.win.loadFile(path, options)
            }
        }
    }

    loadURL(url: string) {
        console.log('Load URL: ', url)
        this.state.win && this.state.win.loadURL(url)
    }

    send(channel: string, ...args: any[]) {
        console.log('SEND: ', channel, JSON.stringify(args).length + ' bytes')
        this.states.forEach(state => state.win && state.win.webContents.send(channel, ...args))
        // this.state.win && this.state.win.webContents.send(channel, ...args)
    }

    getExternalDisplay() {
        return EScreen.getAllDisplays().find(display => {
            return display.bounds.x !== 0 || display.bounds.y !== 0
        })
    }

    closeAll() {
        this.tobeClosed = true
        app.quit()
    }

    storeItem(item: string, value: string) {
        this.states[0].win.webContents.executeJavaScript(`localStorage.setItem('${item}','${value}')`)
    }

    loadItem(item: string) {
        return this.states[0].win.webContents.executeJavaScript(`localStorage.getItem('${item}')`)
    }

    moveWindowToDebugScreen(win: BrowserWindow, width: number, height: number) {
        const externalDisplay = this.getExternalDisplay()
        if (externalDisplay && isDev) {
            win.setPosition(
                externalDisplay.bounds.x + (externalDisplay.bounds.width / 2 - width / 2),
                externalDisplay.bounds.y + (externalDisplay.bounds.height / 2 - height / 2)
            )
        }
    }
}
