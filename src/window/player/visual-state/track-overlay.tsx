import * as React from 'react'
import { PlayerVisualState, SpotifyEvents, PlayerVisualStateId } from 'utils/types'
import { BaseOverlayState } from './base'
import { ProgressCircle } from 'react-desktop'
import { ipcRenderer } from 'electron'
import { PlayerTrackInfo } from './track'

export class TrackOverlayState extends BaseOverlayState implements PlayerVisualState {
    stateId = PlayerVisualStateId.Track

    render() {
        return this.renderWithOverlay(
            this.getState().features.id === this.getState().trackId ? (
                <PlayerTrackInfo track={this.getState().track} onAction={this.options.getOnAction()} features={this.getState().features} />
            ) : (
                <ProgressCircle size={25} />
            )
        )
    }

    onEnter() {
        this.mouseHover = true
        ipcRenderer.send(SpotifyEvents.TrackInfo, this.getState().trackId)
    }

    onExit() {
        this.mouseHover = false
    }
}
