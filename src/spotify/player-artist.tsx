import * as React from 'react'
import { SpotifyArtist, SpotifyTrack, PlayerAction } from '../utils/types'
import { bem } from '../utils'

import './index.less'
import { SvgButton } from './button'

const styles = bem('artistinfo')

interface Props {
    artist: SpotifyArtist
    top10: SpotifyTrack[]
    onAction: (action: PlayerAction, ...args) => void
}

interface State {}

export class PlayerArtistInfo extends React.Component<Props, State> {
    state: State = {}

    render() {
        return (
            <div className={styles()}>
                <div>
                    <div className={styles('img')}>
                        <SvgButton
                            className={styles('img_play')}
                            img={'play'}
                            width={50}
                            onClick={this.onPlayTrack.bind(this, undefined)}
                        />
                        {this.props.artist.images[0] ? <img width={100} src={this.props.artist.images[0].url} /> : <div>No Image</div>}
                    </div>
                    <div>
                        {this.props.artist.followers.total} / {this.props.artist.popularity}
                    </div>
                </div>
                <div className={styles('top')}>
                    {this.props.top10.map((one, index) => (
                        <div key={'td_' + index} className={styles('track')}>
                            <div>
                                <SvgButton
                                    className={styles('track-play')}
                                    img={'play'}
                                    width={15}
                                    onClick={this.onPlayTrack.bind(this, one)}
                                />
                            </div>
                            <div className={styles('track-name')} onClick={this.onPlayTrack.bind(this, one)}>
                                {index + 1}. {one.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    onPlayTrack(track?: SpotifyTrack) {
        this.props.onAction(PlayerAction.Play, track ? track.uri : this.props.top10.map(one => one.uri))
    }
}
