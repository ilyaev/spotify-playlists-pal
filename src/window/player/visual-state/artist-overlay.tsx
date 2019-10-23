import * as React from 'react'
import { PlayerVisualState, SpotifyEvents } from '../../../utils/types'
import { PlayerArtistInfo } from '../artist'
import { State as PlayerState } from '../index'
import { BaseOverlayState } from './base'
import { ProgressCircle } from 'react-desktop'
import { bem } from '../../../utils'
import { ipcRenderer } from 'electron'

import '../../index.less'

const styles = bem('player')

export class ArtistOverlayState extends BaseOverlayState implements PlayerVisualState {
    stateId = 'ARTIST'

    render() {
        return (
            <div
                className={styles('artist')}
                onMouseEnter={() => {
                    this.mouseHover = true
                }}
                onMouseLeave={() => {
                    this.mouseHover = false
                    this.options.exitState()
                }}
            >
                {this.getState().artist.name ? (
                    <PlayerArtistInfo
                        artist={this.getState().artist}
                        top10={this.getState().artistTopTracks}
                        onAction={this.options.getOnAction()}
                    />
                ) : (
                    <ProgressCircle size={25} />
                )}
            </div>
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
