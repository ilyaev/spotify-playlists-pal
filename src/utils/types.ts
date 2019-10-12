export const INSTANCE_ID = 'atz'

export interface SpotifyArtist {
    name: string
    uri: string
    type: string
    external_urls: any[]
}

export interface SpotifyAlbum {
    uri: string
    release_date: string
    name: string
    images: any[]
    album_type: string
    total_tracks: number
    artists: SpotifyArtist[]
}
export interface SpotifyRecentItem {
    played_at: string
    track: {
        type: string
        uri: string
        name: string
        preview_url: string
        artists: SpotifyArtist[]
        album: SpotifyAlbum
    }
    context: {
        type: string
        uri: string
    }
}

export interface SpotifyMe {
    display_name: string
    email: string
    external_urls: {
        spotify: string
    }
    id: string
    images: { url: string }[]
    product: string
    type: string
    uri: string
}

export interface SpotifyPlaylist {
    id: string
    name: string
    uri: string
    images: { url: string }[]
    tracks: { total: number; href: string }
    total_tracks: number
}

export interface SpotifyPlaybackState {
    context: {
        type: string
        uri: string
    }
    is_playing: boolean
    shuffle_state: 'off' | 'on'
    device: {
        id: string
        is_active: boolean
        name: string
        type: string
        volume_percent: number
    }
    progress_ms: number
    currently_playing_type: string
}

export interface SpotifyFavoriteList {
    uri: string
    count: number
    ts: any
}

export interface SpotifyAuth {
    success: boolean
    access_token: string
    scope: string
}

export enum SpotifyEvents {
    List = 'SPOTIFY-LIST',
    State = 'SPOTIFY-STATE',
    Menu = 'SPOTIFY-SYNCMENU',
    Play = 'SPOTIFY-PLAY',
    Settings = 'SPOTIFY-SETTINGS',
    SendList = 'SPOTIFY-SEND-LIST'
}
