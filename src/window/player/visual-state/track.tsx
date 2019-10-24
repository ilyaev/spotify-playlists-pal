import * as React from 'react'
import { SpotifyTrack, PlayerAction, SpotifyTrackFeatures } from 'utils/types'
import { bem } from 'src/utils'

import '../../index.less'

const styles = bem('artistinfo')

interface Props {
    track: SpotifyTrack
    features: SpotifyTrackFeatures
    onAction: (action: PlayerAction, ...args) => void
}

interface State {}

export class PlayerTrackInfo extends React.Component<Props, State> {
    state: State = {}

    render() {
        return (
            <div className={styles()}>
                <div className={styles('title')} title={this.props.track.name}>
                    {this.props.track.name}
                </div>
            </div>
        )
    }
}
