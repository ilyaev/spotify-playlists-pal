import * as React from 'react'
import { SpotifyArtist, SpotifyTrack, PlayerAction, SpotifyAlbum } from '../../utils/types'
import { bem } from '../../utils'

import '../index.less'
import { SvgButton } from './button'

const styles = bem('artistinfo')

interface Props {
    album: SpotifyAlbum
    onAction: (action: PlayerAction, ...args) => void
}

interface State {}

export class PlayerAlbumInfo extends React.Component<Props, State> {
    state: State = {}

    render() {
        return (
            <div className={styles()}>
                <div className={styles('title')}>{this.props.album.name}</div>
                <div style={{ display: 'flex' }}>
                    <div>
                        <div className={styles('img')}>
                            <SvgButton
                                className={styles('img_play')}
                                img={'play'}
                                width={50}
                                onClick={this.onPlayTrack.bind(this, undefined)}
                            />
                            {this.props.album.images[0] ? <img width={100} src={this.props.album.images[0].url} /> : <div>No Image</div>}
                        </div>
                        {this.props.album.genres
                            .map(genre => (
                                <div className={styles('genre')} key={genre} title={genre} onClick={this.onGenreClick.bind(this, genre)}>
                                    {genre[0].toUpperCase() + genre.substr(1)}
                                </div>
                            ))
                            .slice(0, 5)}
                    </div>
                    <div className={styles('top')}>
                        {this.props.album.tracks.items.map((one, index) => (
                            <div key={'td_' + index} className={styles('track')}>
                                <div>
                                    <SvgButton
                                        className={styles('track-play')}
                                        img={'play'}
                                        width={15}
                                        onClick={this.onPlayTrack.bind(this, one)}
                                    />
                                </div>
                                <div className={styles('track-name')} onClick={this.onPlayTrack.bind(this, one)} title={one.name}>
                                    {index + 1}. {one.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles('bottom')}>
                    <div className={styles('bottom-column')}>
                        <div className={styles('bignumber')}>{this.formatReleaseDate()}</div>
                        <div>Release Date</div>
                    </div>
                    <div className={styles('bottom-column')}>
                        <div className={styles('bignumber')}>{this.props.album.popularity}</div>
                        <div>Popularity</div>
                    </div>
                </div>
            </div>
        )
    }

    formatReleaseDate() {
        const its = this.props.album.release_date.split('-')
        return its[1] + '/' + its[0]
    }

    onPlayTrack(track?: SpotifyTrack) {
        this.props.onAction(PlayerAction.Play, track ? track.uri : this.props.album.tracks.items.map(one => one.uri))
    }

    onGenreClick(genre) {
        this.props.onAction(PlayerAction.PlayGenre, genre)
    }
}
