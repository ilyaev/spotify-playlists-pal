import * as React from 'react'
import { PlayerVisualState, SpotifyEvents, PlayerVisualStateId } from 'utils/types'
import { PlayerArtistInfo } from './artist'
import { BaseOverlayState } from './base'
import { ProgressCircle } from 'react-desktop'
import { ipcRenderer } from 'electron'

export class ArtistOverlayState extends BaseOverlayState implements PlayerVisualState {
    stateId = PlayerVisualStateId.Artist

    render() {
        return this.renderWithOverlay(
            this.getState().artist.name ? (
                <PlayerArtistInfo
                    artist={this.getState().artist}
                    top10={this.getState().artistTopTracks}
                    onAction={this.options.getOnAction()}
                />
            ) : (
                <ProgressCircle size={25} />
            )
        )
    }

    onEnter() {
        this.mouseHover = true
        ipcRenderer.send(SpotifyEvents.ArtistInfo, this.getState().artistId)
    }

    onExit() {
        this.mouseHover = false
    }
}
