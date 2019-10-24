import * as React from 'react'
import { PlayerVisualState, PlayerAction, PlayerVisualStateId } from 'utils/types'
import { State as PlayerState } from '../index'
import { bem } from 'src/utils'

import '../../index.less'

const styles = bem('player')

interface StateOptions {
    getOnAction: () => (action: PlayerAction, ...args) => void
    getState: () => PlayerState
    exitState: (nextState?: string) => void
}

export class BaseOverlayState implements Omit<PlayerVisualState, 'render'> {
    options: StateOptions
    stateId: PlayerVisualStateId = PlayerVisualStateId.Default
    getState: () => PlayerState
    mouseHover = false

    constructor(options: StateOptions) {
        this.options = options
        this.getState = options.getState
    }

    onEnter() {}

    onExit() {}

    renderWithOverlay(children: React.ReactNode) {
        return (
            <div
                className={styles('overlay')}
                onMouseEnter={() => {
                    this.mouseHover = true
                }}
                onMouseLeave={() => {
                    this.mouseHover = false
                    this.options.exitState()
                }}
            >
                {children}
            </div>
        )
    }
}
