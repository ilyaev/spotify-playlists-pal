import * as React from 'react'
import { bem, waitForTime } from '../../utils'
import {
    SpotifyPlaybackState,
    PlayerAction,
    SpotifyEvents,
    SpotifyArtist,
    SpotifyTrack,
    PlayerMode,
    PlayerVisualState,
    SpotifyAlbum,
} from '../../utils/types'
import { SvgButton } from './button'
import { PlayerProgressBar } from './progress-bar'
import { ArtistOverlayState } from './visual-state/artist-overlay'
import { AlbumOverlayState } from './visual-state/album-overlay'

import '../index.less'
import { ipcRenderer } from 'electron'

const styles = bem('player')

interface Props {
    playbackState: SpotifyPlaybackState
    active: boolean
    updatePlaybackState: () => void
    onPlayerAction: (action: PlayerAction, ...arg1s: any) => void
}

export interface State {
    progress: number
    total: number
    artist: SpotifyArtist
    album: SpotifyAlbum
    artistTopTracks: SpotifyTrack[]
    mode: PlayerMode
    artistId: string
    albumId: string
    hideArtist: boolean
    vstate: string | 'DEFAULT' | 'ARTIST' | 'ALBUM'
}

export class PagePlayer extends React.Component<Props, State> {
    waitId: any
    vstates: PlayerVisualState[]

    state: State = {
        progress: 0,
        artistId: '',
        albumId: '',
        total: 0,
        mode: PlayerMode.Track,
        artist: {} as SpotifyArtist,
        album: {} as SpotifyAlbum,
        artistTopTracks: [],
        hideArtist: true,
        vstate: 'DEFAULT',
    }

    constructor(...args: any) {
        super(args)
        const vstateOptions = {
            getState: () => this.state,
            getOnAction: () => this.props.onPlayerAction,
            exitState: this.exitVisualState.bind(this),
        }

        this.vstates = [new ArtistOverlayState(vstateOptions), new AlbumOverlayState(vstateOptions)]
    }

    componentDidMount() {
        ipcRenderer.on(SpotifyEvents.ArtistInfo, (_event, artist, top10) => {
            this.setState({
                artist,
                artistTopTracks: top10.tracks || [],
            })
        })
        ipcRenderer.on(SpotifyEvents.AlbumInfo, (_event, album: SpotifyAlbum) => {
            this.setState({ album })
        })
    }

    componentWillReceiveProps(newProps: Props) {
        if (!newProps.active && this.waitId) {
            clearInterval(this.waitId)
        }

        const restMs = newProps.playbackState.item ? newProps.playbackState.item.duration_ms - newProps.playbackState.progress_ms : 0

        if (restMs > 0 && newProps.playbackState && newProps.playbackState.progress_ms > 0) {
            this.setState({
                progress: newProps.playbackState.progress_ms,
                total: newProps.playbackState.item.duration_ms,
                artistId: newProps.playbackState.item.artists[0].id,
                albumId: newProps.playbackState.item.album.id,
                mode: this.state.hideArtist ? PlayerMode.Track : this.state.mode,
            })
            newProps.active &&
                waitForTime(1).then(() => {
                    this.waitForNext(restMs + 2000)
                })
        }
    }

    waitForNext(ms: number) {
        if (this.waitId) {
            clearInterval(this.waitId)
        }
        if (!this.props.playbackState.is_playing) {
            return
        }
        this.waitId = setTimeout(() => {
            delete this.waitId
            this.props.updatePlaybackState()
        }, ms)
    }

    render() {
        const loaded = this.props.playbackState.item

        if (!loaded) {
            return <div>Loading</div>
        }

        const track = this.props.playbackState.item.name
        const artist = this.props.playbackState.item.artists[0].name
        const album = this.props.playbackState.item.album.name
        const img = this.props.playbackState.item.album.images[1].url
        const isPlaying = this.props.playbackState.is_playing

        return (
            <div className={styles()}>
                {this.renderVisualState()}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={styles('track_controls')}>
                        <SvgButton
                            img={'shuffle'}
                            width={20}
                            green={this.props.playbackState.shuffle_state}
                            onClick={() => this.props.onPlayerAction(PlayerAction.ToggleShuffle)}
                        />
                        <SvgButton img={'next'} flip onClick={() => this.props.onPlayerAction(PlayerAction.Prev)} />
                        <SvgButton
                            img={isPlaying ? 'pause' : 'play'}
                            onClick={() => this.props.onPlayerAction(isPlaying ? PlayerAction.Pause : PlayerAction.Play)}
                        />
                        <SvgButton img={'next'} onClick={() => this.props.onPlayerAction(PlayerAction.Next)} />
                        <SvgButton
                            img={'repeat'}
                            width={20}
                            green={this.props.playbackState.repeat_state !== 'off'}
                            onClick={() => this.props.onPlayerAction(PlayerAction.ToggleRepeat)}
                        />
                    </div>
                    <div className={styles('track')}>{track}</div>
                    <div className={styles('context_image')}>
                        <img src={img} width={300} style={{ verticalAlign: 'text-top' }} />
                    </div>
                    {this.renderContextRow(artist, album, this.props.playbackState.item.album.uri)}
                    <div style={{ width: '300px' }}>
                        <PlayerProgressBar
                            total={this.state.total}
                            startFrom={this.state.progress}
                            active={this.props.active && isPlaying}
                            onClick={perc => {
                                this.props.onPlayerAction(PlayerAction.Rewind, Math.floor((perc / 100) * this.state.total))
                            }}
                        />
                    </div>
                </div>
            </div>
        )
    }

    renderContextRow(artistName: string, albumName: string, uri: string) {
        return (
            <div className={styles('context')}>
                <span
                    onMouseEnter={() => this.setVisualState('ARTIST')}
                    onMouseLeave={() => this.exitVisualState()}
                    className={styles('context-artist')}
                >
                    {artistName}
                </span>
                &nbsp;-&nbsp;
                <div
                    className={styles('context-album')}
                    onMouseEnter={() => this.setVisualState('ALBUM')}
                    onMouseLeave={() => this.exitVisualState()}
                    onClick={() => {
                        this.props.onPlayerAction(PlayerAction.PlayContextURI, uri)
                    }}
                >
                    <div>{albumName}</div>
                    <SvgButton className={styles('context-album-play')} img={'play'} width={15} />
                </div>
            </div>
        )
    }

    renderVisualState() {
        const vstate = this.getCurrentVisualState()
        if (!vstate) {
            return null
        }
        return vstate.render()
    }

    async setVisualState(newState: string) {
        const vstate = this.getCurrentVisualState()
        if (newState === this.state.vstate) {
            if (vstate) {
                vstate.onEnter()
            }
            return
        }
        if (vstate) {
            vstate.onExit()
        }

        this.setState({ vstate: newState }, () => {
            const nextVState = this.getCurrentVisualState()
            nextVState && nextVState.onEnter()
        })
    }

    getCurrentVisualState() {
        return this.vstates.find(one => one.stateId === this.state.vstate)
    }

    async exitVisualState(nextState?: string) {
        const lastStateId = '' + this.state.vstate
        const lastState = this.getCurrentVisualState()
        if (lastState) {
            lastState.mouseHover = false
        }
        await waitForTime(500)
        if (lastStateId === this.state.vstate && lastState && !lastState.mouseHover) {
            this.setVisualState(nextState || 'DEFAULT')
        }
    }
}
