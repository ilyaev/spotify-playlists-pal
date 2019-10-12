import { SpotifyPlaylist, SpotifyFavoriteList, SpotifyRecentItem, SpotifyAlbum } from '../utils/types'

const findByUri = uri => item => (item.uri === uri ? true : false)
const appendArtistToAlbum = (one: SpotifyAlbum) =>
    Object.assign({}, one, { name: one.artists[0] ? one.name + ' - ' + one.artists[0].name : one.name })

export class SpotifyPlaylists {
    all: SpotifyPlaylist[] = []
    favs: SpotifyFavoriteList[] = []
    recent: SpotifyRecentItem[] = []
    recentAlbums: SpotifyAlbum[] = []
    albums: SpotifyAlbum[] = []

    constructor() {}

    sync(lists: SpotifyPlaylist[], favorites: SpotifyFavoriteList[], recent: SpotifyRecentItem[], albums: SpotifyAlbum[]) {
        this.all = [...lists].sort((a, b) => (a.name > b.name ? 1 : -1))
        this.favs = [...favorites]
        this.recent = [...recent]
        this.albums = albums.map(appendArtistToAlbum)
        this.recentAlbums = Object.values(
            this.recent
                .filter(one => (one.context && one.context.type === 'album' ? true : false))
                .reduce((res, next) => {
                    if (typeof res[next.track.album.uri] === 'undefined') {
                        res[next.track.album.uri] = next.track.album
                    }
                    return res
                }, {})
        ).map(appendArtistToAlbum)
    }

    addFavorite(uri: string) {
        const itemIndex = this.all.findIndex(findByUri(uri))
        const albumIndex = this.recentAlbums.findIndex(findByUri(uri))
        const allAlbumIndex = this.albums.findIndex(findByUri(uri))
        const favIndex = this.favs.findIndex(findByUri(uri))

        if (itemIndex < 0 && albumIndex < 0 && allAlbumIndex < 0) {
            return this.favs
        }

        if (favIndex >= 0) {
            this.favs[favIndex] = Object.assign({}, this.favs[favIndex], { count: this.favs[favIndex].count + 1, ts: new Date() })
        } else {
            this.favs = this.favs.slice(0, 9)
            this.favs.push({ uri, count: 0, ts: new Date() })
        }

        this.favs = this.favs.sort((a, b) => (a.count > b.count ? -1 : 1))

        return this.favs
    }

    getPlaylists(uris: string[]): SpotifyPlaylist[] {
        return this.all.filter(item => (uris.indexOf(item.uri) !== -1 ? true : false))
    }

    getFavPlaylists(): SpotifyPlaylist[] {
        const list = this.getPlaylists(this.favs.map(item => item.uri))
        return this.favs
            .map(item => {
                const playlist = list.find(one => one.uri === item.uri)
                const album = this.recentAlbums.find(one => one.uri === item.uri) || this.albums.find(one => one.uri === item.uri)
                return playlist || album || ({ name: 'NoName', uri: '' } as any)
            })
            .filter(one => (one.uri ? true : false))
    }
}
