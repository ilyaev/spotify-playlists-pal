import { SpotifyPlaylist, SpotifyFavoriteList, SpotifyRecentItem, SpotifyAlbum } from '../utils/types'
import { LOAD_LIST_PER_PAGE } from '../utils/const'
import { spotifyApi } from '../utils/api'

const findByUri = (uri: string) => (item: { uri: string }) => (uri.indexOf(item.uri) !== -1 ? true : false)
const findById = (id: string) => (item: { id: string }) => (id.indexOf(item.id) !== -1 ? true : false)

const appendArtistToAlbum = (one: SpotifyAlbum) =>
    Object.assign({}, one, { name: one.artists[0] ? one.name + ' - ' + one.artists[0].name : one.name })

export class SpotifyPlaylists {
    all: SpotifyPlaylist[] = []
    favs: SpotifyFavoriteList[] = []
    recent: SpotifyRecentItem[] = []
    recentAlbums: SpotifyAlbum[] = []
    albums: SpotifyAlbum[] = []
    max_size: number = 10

    constructor() {}

    sync(lists: SpotifyPlaylist[], favorites: SpotifyFavoriteList[], recent: SpotifyRecentItem[], albums: SpotifyAlbum[]) {
        this.all = [...lists]
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

    clear() {
        this.sync([], [], [], [])
    }

    addFavorite(uri: string, increase: number = 1) {
        const itemIndex = this.all.findIndex(findByUri(uri))
        const albumIndex = this.recentAlbums.findIndex(findByUri(uri))
        const allAlbumIndex = this.albums.findIndex(findByUri(uri))
        const favIndex = this.favs.findIndex(findByUri(uri))

        if (itemIndex < 0 && albumIndex < 0 && allAlbumIndex < 0) {
            return this.favs
        }

        if (favIndex >= 0) {
            this.favs[favIndex] = Object.assign({}, this.favs[favIndex], {
                count: this.favs[favIndex].count + increase,
                ts: new Date().toISOString(),
            })
        } else {
            this.favs = this.favs.slice(0, this.max_size - 1)
            this.favs.push({ uri: uri, count: 0, ts: new Date().toISOString() })
        }

        this.favs = this.favs.sort((a, b) => (a.count > b.count ? -1 : 1))

        return this.favs
    }

    getPlaylists(uris: string[]): SpotifyPlaylist[] {
        return this.all.filter(item => (uris.indexOf(item.uri) !== -1 ? true : false))
    }

    getFavPlaylists(max_size: number, order: string): SpotifyPlaylist[] {
        this.max_size = max_size
        const list = this.getPlaylists(this.favs.map(item => item.uri))
        return [...this.favs]
            .sort((a, b) => (order === 'time_added' ? (a.ts > b.ts ? -1 : 1) : 0))
            .map(item => {
                const playlist = list.find(findByUri(item.uri))
                const album = this.recentAlbums.find(findByUri(item.uri)) || this.albums.find(findByUri(item.uri))
                return playlist || album || ({ name: 'NoName', uri: '' } as any)
            })
            .filter(one => (one.uri ? true : false))
            .slice(0, max_size)
            .sort((a, b) => (order === 'name' ? (a.name > b.name ? 1 : -1) : 0))
    }

    getDisplayNameById(id: string) {
        const playlist = this.all.find(findById(id)) || { name: '' }
        return playlist.name || 'Unknown'
    }

    getDisplayName(uri: string) {
        const playlist = this.all.find(findByUri(uri)) || { name: '' }
        const album = this.albums.find(findByUri(uri)) || { name: '' }
        return playlist.name || album.name || 'Unknown'
    }

    async loadAllPlaylist(): Promise<SpotifyPlaylist[]> {
        try {
            const meta = await spotifyApi.getUserPlaylists(undefined, { limit: 1, fields: 'total,limit' }).then(res => res.body)
            const pages = Math.ceil(meta.total / 50)
            const all: number[] = new Array(pages).fill(1)
            return (await Promise.all(
                all.map((_v, page) =>
                    spotifyApi.getUserPlaylists(undefined, { limit: 50, offset: page * 50 }).then(r => r.body.items || [])
                )
            )).reduce((r, n) => r.concat(n), [])
        } catch (e) {
            console.log('ERROR: Cant load All Playlists', e)
            return []
        }
    }

    async loadAllSavedAlbums(): Promise<SpotifyAlbum[]> {
        try {
            const meta = await spotifyApi.getMySavedAlbums({ limit: 1, fields: 'total,limit' }).then(res => res.body)
            const pages = Math.ceil(meta.total / 50)
            const all: number[] = new Array(pages).fill(1)
            return pages > 0
                ? (await Promise.all(
                      all.map((_v, page) =>
                          spotifyApi.getMySavedAlbums({ limit: 50, offset: page * 50 }).then(r => r.body.items.map(one => one.album))
                      )
                  )).reduce((r, n) => r.concat(n), [])
                : []
        } catch (e) {
            console.log('ERROR: Cant load All Saved Albums', e)
            return []
        }
    }

    async isTrackInPlaylist(playlistId: string, uri: string) {
        try {
            const meta = await spotifyApi.getPlaylistTracks(playlistId, { limit: 1, fields: 'total,limit' }).then(res => res.body)
            const pages = Math.ceil(meta.total / LOAD_LIST_PER_PAGE)
            const all: number[] = new Array(pages).fill(1)

            const playlistTracks = (await Promise.all(
                all.map((_v, page) =>
                    spotifyApi
                        .getPlaylistTracks(playlistId, {
                            limit: LOAD_LIST_PER_PAGE,
                            offset: page * LOAD_LIST_PER_PAGE,
                            fields: 'items(track(uri))',
                        })
                        .then(r => r.body.items || [])
                )
            ))
                .reduce((r, n) => r.concat(n), [])
                .map(one => one.track.uri)

            return playlistTracks.indexOf(uri) === -1 ? false : true
        } catch (e) {
            return true
        }
    }
}
