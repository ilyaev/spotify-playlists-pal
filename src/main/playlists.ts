import { SpotifyPlaylist, SpotifyFavoriteList } from '../utils/types'

const findByUri = uri => item => (item.uri === uri ? true : false)

export class SpotifyPlaylists {
    all: SpotifyPlaylist[] = []
    favs: SpotifyFavoriteList[] = []

    constructor() {}

    sync(lists: SpotifyPlaylist[], favorites: SpotifyFavoriteList[]) {
        this.all = [...lists].sort((a, b) => (a.name > b.name ? 1 : -1))
        this.favs = [...favorites]
    }

    addFavorite(uri: string) {
        const itemIndex = this.all.findIndex(findByUri(uri))
        const favIndex = this.favs.findIndex(findByUri(uri))
        if (itemIndex < 0) {
            return []
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
        return this.favs.map(item => list.find(one => one.uri === item.uri))
    }
}
