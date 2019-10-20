import * as React from 'react'
import { bem, waitForTime } from '../utils'
import { SpotifyPlaybackState, PlayerAction } from '../utils/types'
import { SvgButton } from './button'
import { PlayerProgressBar } from './progress-bar'

import './index.less'

const styles = bem('player')

interface Props {
    playbackState: SpotifyPlaybackState
    active: boolean
    updatePlaybackState: () => void
    onPlayerAction: (action: PlayerAction, ...args) => void
}

interface State {
    progress: number
    total: number
}

export class PagePlayer extends React.Component<Props, State> {
    waitId: any

    componentDidMount() {}

    componentWillReceiveProps(newProps: Props) {
        if (!newProps.active && this.waitId) {
            clearInterval(this.waitId)
        }
        const restMs = newProps.playbackState.item ? newProps.playbackState.item.duration_ms - newProps.playbackState.progress_ms : 0
        if (restMs > 0 && newProps.playbackState && newProps.playbackState.progress_ms > 0) {
            this.setState({
                progress: newProps.playbackState.progress_ms,
                total: newProps.playbackState.item.duration_ms,
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
        const loaded = this.props.playbackState.context

        if (!loaded) {
            return <div>Loading</div>
        }

        const track = this.props.playbackState.item.name
        const context = this.props.playbackState.item.artists[0].name + ' - ' + this.props.playbackState.item.album.name
        const img = this.props.playbackState.item.album.images[1].url
        const isPlaying = this.props.playbackState.is_playing

        return (
            <div className={styles()}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={styles('track_controls')}>
                        <SvgButton img={'next'} flip onClick={() => this.props.onPlayerAction(PlayerAction.Prev)} />
                        <SvgButton
                            img={isPlaying ? 'pause' : 'play'}
                            onClick={() => this.props.onPlayerAction(isPlaying ? PlayerAction.Pause : PlayerAction.Play)}
                        />
                        <SvgButton img={'next'} onClick={() => this.props.onPlayerAction(PlayerAction.Next)} />
                    </div>
                    <div className={styles('track')}>{track}</div>
                    <div className={styles('context_image')}>
                        <img src={img} width={300} style={{ verticalAlign: 'text-top' }} />
                    </div>
                    <div className={styles('context')}>{context}</div>
                    <div style={{ width: '300px' }}>
                        <PlayerProgressBar
                            total={this.state.total}
                            startFrom={this.state.progress}
                            active={this.props.active}
                            onClick={perc => {
                                this.props.onPlayerAction(PlayerAction.Rewind, Math.floor((perc / 100) * this.state.total))
                            }}
                        />
                    </div>
                </div>
            </div>
        )
    }
}
