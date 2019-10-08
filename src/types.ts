export interface SpotfyPlaylist {
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

export enum SpotifyEvents {
    List = 'SPOTIFY-LIST',
    State = 'SPOTIFY-STATE',
    Menu = 'SPOTIFY-SYNCMENU',
    Play = 'SPOTIFY-PLAY',
    Settings = 'SPOTIFY-SETTINGS'
}
