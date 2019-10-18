import * as React from 'react'
import { bem } from '../utils'
import { SpotifyPlaybackState } from 'src/utils/types'

import './index.less'

const styles = bem('player')

interface Props {
    playbackState: SpotifyPlaybackState
}

interface State {
    progress: number
}

export class PagePlayer extends React.Component<Props, State> {
    waitId: any

    componentDidMount() {
        console.log('Mount!', this.props)
    }

    componentWillReceiveProps(newProps: Props) {
        console.log('New Props:', newProps)
        const restMs = newProps.playbackState.item ? newProps.playbackState.item.duration_ms - newProps.playbackState.progress_ms : 0
        if (restMs > 0) {
            console.log('Wait For: ', restMs)
            this.waitForNext(restMs)
        }
    }

    waitForNext(ms: number) {
        if (this.waitId) {
            clearInterval(this.waitId)
        }
        this.waitId = setTimeout(() => {
            console.log('Next!')
            delete this.waitId
        }, ms)
    }

    render() {
        const loaded = this.props.playbackState.context
        const track = loaded ? this.props.playbackState.item.name : ''
        const context = loaded ? this.props.playbackState.item.artists[0].name + ' - ' + this.props.playbackState.item.album.name : ''
        const img = loaded ? this.props.playbackState.item.album.images[1].url : ''
        const perc = loaded
            ? this.props.playbackState.item.duration_ms > 0
                ? Math.round((this.props.playbackState.progress_ms / this.props.playbackState.item.duration_ms) * 100)
                : 0
            : 0
        const restMs = perc > 0 ? this.props.playbackState.item.duration_ms - this.props.playbackState.progress_ms : 0
        return loaded ? (
            <div className={styles()}>
                <div className={styles('context_image')}>
                    <img src={img} width={100} />
                </div>
                <div className={styles('track_container')}>
                    <div>{track}</div>
                    <div>{context}</div>
                    <div>
                        Play Progress - {perc}% rest {restMs}ms
                    </div>
                    <div className={styles('track_controls')}>
                        <div>Prev</div>
                        <div>Play/Resume</div>
                        <div>Next</div>
                    </div>
                </div>
            </div>
        ) : (
            <div>Loading...</div>
        )
    }
}
