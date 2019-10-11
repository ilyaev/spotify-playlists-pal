export const INSTANCE_ID = 'atz'

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
