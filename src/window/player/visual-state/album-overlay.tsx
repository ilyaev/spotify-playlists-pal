import * as React from 'react'
import { PlayerVisualState, SpotifyEvents } from '../../../utils/types'
import { BaseOverlayState } from './base'
import { ProgressCircle } from 'react-desktop'
import { bem } from '../../../utils'
import { ipcRenderer } from 'electron'
import { PlayerAlbumInfo } from '../album'

import '../../index.less'

const styles = bem('player')

export class AlbumOverlayState extends BaseOverlayState implements PlayerVisualState {
    stateId = 'ALBUM'

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
                {this.getState().album.name ? (
                    <PlayerAlbumInfo album={this.getState().album} onAction={this.options.getOnAction()} />
                ) : (
                    <ProgressCircle size={25} />
                )}
            </div>
        )
    }

    onEnter() {
        ipcRenderer.send(SpotifyEvents.AlbumInfo, this.getState().albumId)
        this.mouseHover = true
    }

    onExit() {
        this.mouseHover = false
    }
}
