import { Settings } from './types'

export const APP_WINDOW_WIDTH = 400
export const APP_WINDOW_HEIGHT = 362
export const SETTINGS_STORAGE_KEY = 'SPOTIFY-SETTINGS'
export const INSTANCE_ID_STORAGE_KEY = 'SPOTIFY-INSTANCE-ID'
export const TRAY_ICON_FILE = 'static/play-icon-small.png'
export const SPOTIFY_CALLBACK_URL = 'http://127.0.0.1/'
export const SPOTIFY_AUTH_SCOPE = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'streaming',
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-top-read',
    'user-library-read',
]
export const SPOTIFY_AUTH_STATE = 'supercharge'
export const SETTINGS_DEFAULTS: Settings = {
    max_size: '10',
    order_playlists: 'name',
    order_recent_playlist: 'play_count',
    lunch_at_login: true,
}

export const SPOTIFY_TOKEN_REFRESH_INTERVAL = 1000 * 60 * 50

export { SPOTIFY_TOKEN_SERVER } from '../env'
