import { BrowserWindow, LoadFileOptions, app, Event } from 'electron'
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
        this.setState(BrowserState.Settings)
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
        this.state.win && this.state.win.hide()
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
            this.show()
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
        console.log('SEND: ', channel, JSON.stringify(args[0]).length)
        this.state.win && this.state.win.webContents.send(channel, ...args)
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
}
