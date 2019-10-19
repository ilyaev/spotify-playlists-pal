import * as React from 'react'
import { bem, waitForTime } from '../utils'
import { SpotifyPlaybackState, PlayerAction } from '../utils/types'
import { SvgButton } from './button'

import './index.less'

const styles = bem('player')

interface Props {
    playbackState: SpotifyPlaybackState
    updatePlaybackState: () => void
    onPlayerAction: (action: PlayerAction) => void
}

interface State {
    progress: number
}

export class PagePlayer extends React.Component<Props, State> {
    waitId: any
    progressId: any

    componentDidMount() {}

    componentWillReceiveProps(newProps: Props) {
        const restMs = newProps.playbackState.item ? newProps.playbackState.item.duration_ms - newProps.playbackState.progress_ms : 0
        if (restMs > 0 && newProps.playbackState && newProps.playbackState.progress_ms > 0) {
            this.setState({
                progress: newProps.playbackState.progress_ms,
            })
            waitForTime(1).then(() => {
                this.waitForNext(restMs + 2000)
                this.forwardProgress()
            })
        }
    }

    forwardProgress() {
        if (this.progressId) {
            clearInterval(this.progressId)
        }
        if (!this.props.playbackState.is_playing) {
            return
        }
        this.progressId = setTimeout(() => {
            this.setState({ progress: this.state.progress + 1000 })
            this.forwardProgress()
        }, 1000)
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
        const perc =
            this.props.playbackState.item.duration_ms > 0
                ? Math.round((this.state.progress / this.props.playbackState.item.duration_ms) * 100)
                : 0
        const restMs = perc > 0 ? this.props.playbackState.item.duration_ms - this.props.playbackState.progress_ms : 0

        const isPlaying = this.props.playbackState.is_playing

        return (
            <div className={styles()}>
                <div className={styles('context_image')}>
                    <img src={img} width={100} />
                </div>
                <div className={styles('track_container')}>
                    <div>{track}</div>
                    <div>{context}</div>
                    <div>
                        Play Progress - {perc}% rest {restMs}ms - {this.state.progress}
                    </div>
                    <div className={styles('track_controls')}>
                        <SvgButton img={'next'} flip onClick={() => this.props.onPlayerAction(PlayerAction.Prev)} />
                        <SvgButton
                            img={isPlaying ? 'pause' : 'play'}
                            onClick={() => this.props.onPlayerAction(isPlaying ? PlayerAction.Pause : PlayerAction.Play)}
                        />
                        <SvgButton img={'next'} onClick={() => this.props.onPlayerAction(PlayerAction.Next)} />
                    </div>
                </div>
            </div>
        )
    }
}
