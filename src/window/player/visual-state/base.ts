import { PlayerVisualState, PlayerAction } from '../../../utils/types'
import { State as PlayerState } from '../index'

interface StateOptions {
    getOnAction: () => (action: PlayerAction, ...args) => void
    getState: () => PlayerState
    exitState: (nextState?: string) => void
}

export class BaseOverlayState implements Omit<PlayerVisualState, 'render'> {
    options: StateOptions
    stateId: string = 'BASE'
    getState: () => PlayerState
    mouseHover = false

    constructor(options: StateOptions) {
        this.options = options
        this.getState = options.getState
    }

    onEnter() {}

    onExit() {}
}
