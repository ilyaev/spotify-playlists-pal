import { BrowserWindowConstructorOptions, BrowserWindow, LoadFileOptions } from 'electron'
import {
    CurrentUsersProfileResponse,
    PlaylistObjectFull,
    AlbumObjectFull,
    TrackObjectFull,
    AudioFeaturesObject,
    ArtistObjectFull,
    CurrentPlaybackResponse,
    ImageObject,
    AudioAnalysisResponse,
} from './spotify-types'
import SpotifyWebApi from 'spotify-web-api-node'

export interface SpotifyTrackFeatures extends AudioFeaturesObject {}

export interface SpotifyImage extends ImageObject {}

export interface SpotifyArtist extends ArtistObjectFull {}

export interface SpotifyAlbum extends AlbumObjectFull {}

export interface SpotifyTrack extends TrackObjectFull {}

export interface SpotifyMe extends CurrentUsersProfileResponse {}

export interface SpotifyPlaylist extends PlaylistObjectFull {
    total_tracks?: number
}

export interface SpotifyPlaybackState extends CurrentPlaybackResponse {
    originContextUri: string
}

interface SpotifyAudioInterval {
    start: number
    duration: number
    confidence: number
}

interface SpotifyAudioSection extends SpotifyAudioInterval {
    loudness: number
    tempo: number
    tempo_confidence: number
    key: number
    key_confidence: number
    mode: number
    mode_confidence: number
    time_signature: number
    time_signature_confidence: number
}

interface SpotifyAudioSegment extends SpotifyAudioInterval {
    loudness_start: number
    loudness_max_time: number
    loudness_max: number
    loudness_end: number
    pitches: number[]
    timbre: number[]
}

export interface SpotifyAudioTrack extends SpotifyAudioSection {
    duration: number
    sample_md5: string
    offset_seconds: number
    window_seconds: number
    analysis_sample_rate: number
    analysis_channels: number
    end_of_fade_in: number
    start_of_fade_out: number
    codestring: string
    code_version: number
    echoprintstring: string
    echoprint_version: number
    synchstring: string
    synch_version: number
    rhythmstring: string
    rhythm_version: number
}

export interface SpotifyAudioAnalysis {
    bars: SpotifyAudioInterval[]
    beats: SpotifyAudioInterval[]
    sections: SpotifyAudioSection[]
    segments: SpotifyAudioSegment[]
    tatum: SpotifyAudioInterval
    track: SpotifyAudioTrack
}

export interface SpotifyFavoriteList {
    uri: string
    count: number
    ts: any
}

export interface SpotifyAuth {
    success: boolean
    timestamp: number
    expires_in: number
    access_token: string
    scope: string
}

export interface Settings {
    max_size: string
    order_recent_playlist: string
    order_playlists: string
    lunch_at_login: boolean
    playlist: string
}

export interface SpotifyRecentItem {
    played_at: string
    track: SpotifyTrack
    context: {
        type: string
        uri: string
    }
}

export enum SpotifyEvents {
    Me = 'SPOTIFY-ME',
    List = 'SPOTIFY-LIST',
    State = 'SPOTIFY-STATE',
    Menu = 'SPOTIFY-SYNCMENU',
    Play = 'SPOTIFY-PLAY',
    Next = 'SPOTIFY-NEXT',
    Prev = 'SPOTIFT-PREV',
    Pause = 'SPOTIFY-PAUSE',
    Rewind = 'SPOTIFY-REWIND',
    Settings = 'SPOTIFY-SETTINGS',
    SendList = 'SPOTIFY-SEND-LIST',
    SendState = 'SPOTIFY-SEND-STATE',
    SendMe = 'SPOTIFY-SEND-ME',
    ApplySettings = 'SPOTIFY-APPLY-SETTINGS',
    CancelSettings = 'SPOTIFY-CANCEL-SETTINGS',
    ToggleShuffle = 'SPOTIFY-TOGGLE-SHUFFLE',
    ToggleRepeat = 'SPOTIFY-TOGGLE-REPEAT',
    ArtistInfo = 'SPOTIFY-ARTIST-INFO',
    AlbumInfo = 'SPOTIFY-ALBUM-INFO',
    TrackInfo = 'SPOTIFY-TRACK-INFO',
    PlayContextURI = 'SPOTIFY-PLAY-CONTEXT-URI',
    PlayGenre = 'SPOTIFY-PLAY-GENRE',
    TrackAnalysis = 'SPOTIFY-TRACK-ANALYSIS',
}

export enum BrowserState {
    Settings = 'settings',
    Player = 'player',
    Index = 'index',
    Visualizer = 'visualizer',
}

export enum PlayerAction {
    Play = 'PLAYER-PLAY',
    Next = 'PLAYER-NEXT',
    Prev = 'PLAYER-PREV',
    Pause = 'PLAYER-PAUSE',
    Rewind = 'PLAYER-REWIND',
    ToggleShuffle = 'PLAYER-TOGGLE-SHUFFLE',
    ToggleRepeat = 'PLAYER-TOGGLE-REPEAT',
    PlayContextURI = 'PLAYER-PLAY-CONTEXT-URI',
    PlayGenre = 'PLAYER-PLAY-GENRE',
}

export interface AppBrowserOptions extends LoadFileOptions {
    position?: { x: number; y: number }
    hidden?: boolean
}

export interface AppBrowserState {
    stateId: string
    config: BrowserWindowConstructorOptions
    win: BrowserWindow
    onExit: () => void
    onEnter: (options?: AppBrowserOptions, refresh?: true) => void
    auth: (url: string) => void
}

export enum PlayerMode {
    Track = 'PLAYER-MODE-TRACK',
    Artist = 'PLAYER-MODE-ARTIST',
}

export enum PlayerVisualStateId {
    Default = 'DEFAULT',
    Artist = 'ARTIST',
    Album = 'ALBUM',
    Track = 'TRACK',
}

export interface PlayerVisualState {
    stateId: PlayerVisualStateId
    render: () => React.ReactNode
    onEnter: () => void
    onExit: () => void
    mouseHover: boolean
}

export interface ExtendedSpotifyApi extends SpotifyWebApi {
    get: <T>(url: string, params?: any) => Promise<T>
}

export * from './spotify-types'
