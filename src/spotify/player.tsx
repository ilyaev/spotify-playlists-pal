import * as React from 'react'
import { bem, waitForTime } from '../utils'
import { SpotifyPlaybackState, PlayerAction, SpotifyEvents, SpotifyArtist, SpotifyTrack, PlayerMode } from '../utils/types'
import { SvgButton } from './button'
import { PlayerProgressBar } from './progress-bar'
import { PlayerArtistInfo } from './player-artist'
import { ProgressCircle } from 'react-desktop'

import './index.less'
import { ipcRenderer } from 'electron'

const styles = bem('player')

interface Props {
    playbackState: SpotifyPlaybackState
    active: boolean
    updatePlaybackState: () => void
    onPlayerAction: (action: PlayerAction, ...args: any) => void
}

interface State {
    progress: number
    total: number
    artist: SpotifyArtist
    artistTopTracks: SpotifyTrack[]
    artistLoaded: boolean
    mode: PlayerMode
    hideArtist: boolean
}

export class PagePlayer extends React.Component<Props, State> {
    waitId: any

    state: State = {
        progress: 0,
        total: 0,
        mode: PlayerMode.Track,
        artist: {} as SpotifyArtist,
        artistTopTracks: [],
        artistLoaded: false,
        hideArtist: true,
    }

    componentDidMount() {
        ipcRenderer.on(SpotifyEvents.ArtistInfo, (_event, artist, top10) => {
            this.setState({
                artist,
                artistTopTracks: top10.tracks || [],
                artistLoaded: true,
            })
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
                {this.state.mode === PlayerMode.Artist && this.renderArtistInfo()}
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
                        {this.state.mode === PlayerMode.Track && <img src={img} width={300} style={{ verticalAlign: 'text-top' }} />}
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
                    onMouseEnter={this.contextTooltip.bind(this)}
                    onMouseLeave={() => {
                        this.setState({ hideArtist: true })
                        this.hideContextTooltip(1000)
                    }}
                    className={styles('context-artist')}
                >
                    {artistName}
                </span>
                &nbsp;-&nbsp;
                <div
                    className={styles('context-album')}
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

    renderArtistInfo() {
        return (
            <div
                className={styles('artist')}
                onMouseEnter={() => {
                    this.setState({ hideArtist: false })
                }}
                onMouseLeave={() => {
                    this.setState({ hideArtist: true })
                    this.hideContextTooltip(500)
                }}
            >
                {this.state.artistLoaded ? (
                    <PlayerArtistInfo
                        artist={this.state.artist}
                        top10={this.state.artistTopTracks}
                        onAction={(action, ...args) => {
                            this.props.onPlayerAction(action, ...args)
                        }}
                    />
                ) : (
                    <ProgressCircle size={25} />
                )}
            </div>
        )
    }

    async hideContextTooltip(ms: number = 0) {
        await waitForTime(ms)
        this.state.hideArtist && this.setState({ mode: PlayerMode.Track, hideArtist: true })
    }

    contextTooltip() {
        this.setState({ artistLoaded: false, mode: PlayerMode.Artist, hideArtist: false })
        ipcRenderer.send(SpotifyEvents.ArtistInfo, this.props.playbackState.item.artists[0].id)
    }
}
