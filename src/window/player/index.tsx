/* eslint-disable no-unused-vars */
import * as React from 'react'
import { bem, waitForTime } from 'src/utils'
import {
    SpotifyPlaybackState,
    PlayerAction,
    SpotifyEvents,
    SpotifyArtist,
    SpotifyTrack,
    PlayerMode,
    PlayerVisualState,
    SpotifyAlbum,
    PlayerVisualStateId,
    SpotifyTrackFeatures,
} from '../../utils/types'
import { SvgButton } from './components/button'
import { PlayerProgressBar } from './components/progress-bar'
import { ArtistOverlayState } from './visual-state/artist-overlay'
import { AlbumOverlayState } from './visual-state/album-overlay'
import { TrackOverlayState } from './visual-state/track-overlay'

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
    track: SpotifyTrack
    artistTopTracks: SpotifyTrack[]
    mode: PlayerMode
    features: SpotifyTrackFeatures
    artistId: string
    albumId: string
    trackId: string
    hideArtist: boolean
    vstate: PlayerVisualStateId
}

export class PagePlayer extends React.Component<Props, State> {
    waitId: any
    vstates: PlayerVisualState[]

    state: State = {
        progress: 0,
        artistId: '',
        albumId: '',
        trackId: '',
        total: 0,
        mode: PlayerMode.Track,
        artist: {} as SpotifyArtist,
        album: {} as SpotifyAlbum,
        track: {} as SpotifyTrack,
        features: {} as SpotifyTrackFeatures,
        artistTopTracks: [],
        hideArtist: true,
        vstate: PlayerVisualStateId.Default,
    }

    constructor(props: Props) {
        super(props)
        const vstateOptions = {
            getState: () => this.state,
            getOnAction: () => this.props.onPlayerAction,
            exitState: this.exitVisualState.bind(this),
        }

        this.vstates = [
            new ArtistOverlayState(vstateOptions),
            new AlbumOverlayState(vstateOptions),
            new TrackOverlayState(vstateOptions),
        ]
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
        ipcRenderer.on(SpotifyEvents.TrackInfo, (_event, features: SpotifyTrackFeatures) => {
            this.setState({ features })
        })
    }

    componentWillReceiveProps(newProps: Props) {
        if (!newProps.active && this.waitId) {
            clearInterval(this.waitId)
        }

        const restMs = newProps.playbackState.item
            ? newProps.playbackState.item.duration_ms - newProps.playbackState.progress_ms
            : 0

        if (restMs > 0 && newProps.playbackState && newProps.playbackState.progress_ms > 0) {
            this.setState(
                {
                    progress: newProps.playbackState.progress_ms,
                    total: newProps.playbackState.item.duration_ms,
                    artistId: newProps.playbackState.item.artists[0].id,
                    trackId: newProps.playbackState.item.id,
                    albumId: newProps.playbackState.item.album.id,
                    track: newProps.playbackState.item,
                    mode: this.state.hideArtist ? PlayerMode.Track : this.state.mode,
                },
                () => {
                    newProps.active && this.waitForNext(restMs + 2000)
                }
            )
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
                            onClick={() =>
                                this.props.onPlayerAction(isPlaying ? PlayerAction.Pause : PlayerAction.Play)
                            }
                        />
                        <SvgButton img={'next'} onClick={() => this.props.onPlayerAction(PlayerAction.Next)} />
                        <SvgButton
                            img={'repeat'}
                            width={20}
                            green={this.props.playbackState.repeat_state !== 'off'}
                            onClick={() => this.props.onPlayerAction(PlayerAction.ToggleRepeat)}
                        />
                    </div>
                    <div
                        className={styles('track')}
                        // onMouseEnter={() => this.setVisualState(PlayerVisualStateId.Track)}
                        // onMouseLeave={this.exitVisualState.bind(this)}
                    >
                        {track}
                    </div>
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
                                this.props.onPlayerAction(
                                    PlayerAction.Rewind,
                                    Math.floor((perc / 100) * this.state.total)
                                )
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
                <div
                    onMouseEnter={() => this.setVisualState(PlayerVisualStateId.Artist)}
                    onMouseLeave={this.exitVisualState.bind(this)}
                    className={styles('context-artist')}
                    onClick={() => {
                        this.props.onPlayerAction(PlayerAction.Play, this.state.artistTopTracks.map(one => one.uri))
                    }}
                >
                    {artistName}
                </div>
                <div>&nbsp;-&nbsp;</div>
                <div
                    className={styles('context-album')}
                    title={albumName}
                    onMouseEnter={() => this.setVisualState(PlayerVisualStateId.Album)}
                    onMouseLeave={this.exitVisualState.bind(this)}
                    onClick={() => {
                        this.props.onPlayerAction(PlayerAction.PlayContextURI, uri)
                    }}
                >
                    {albumName}
                </div>
                <SvgButton className={styles('context-album-play')} img={'play'} width={15} />
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

    async setVisualState(newState: PlayerVisualStateId) {
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

    async exitVisualState(nextState?: PlayerVisualStateId) {
        const lastStateId = '' + this.state.vstate
        const lastState = this.getCurrentVisualState()
        if (lastState) {
            lastState.mouseHover = false
        }
        await waitForTime(500)
        if (lastStateId === this.state.vstate && lastState && !lastState.mouseHover) {
            this.setVisualState(nextState || PlayerVisualStateId.Default)
        }
    }
}
