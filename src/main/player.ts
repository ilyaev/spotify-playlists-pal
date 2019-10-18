import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron'

import { isDev } from '../main'

export class MiniPlayerWindow extends BrowserWindow {
    constructor(options?: BrowserWindowConstructorOptions) {
        super(
            Object.assign(
                {
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
                } as BrowserWindowConstructorOptions,
                options
            )
        )

        this.loadFile('index.html', { hash: 'PLAYER' })

        this.on('blur', () => {
            isDev || this.hide()
        })
    }
}
