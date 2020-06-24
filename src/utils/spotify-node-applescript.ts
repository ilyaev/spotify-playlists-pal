/* eslint-disable no-unused-vars */
//(c) npm i spotify-node-applescript

var util = require('util'),
    exec = require('child_process').exec,
    applescript = require('applescript')

var scripts = {
    state: {
        file: 'get_state.applescript',
    },
    track: {
        file: 'get_track.applescript',
    },
    volumeUp: {
        file: 'volume_up.applescript',
    },
    volumeDown: {
        file: 'volume_down.applescript',
    },
    setVolume: 'tell application "Spotify" to set sound volume to %s',
    play: 'tell application "Spotify" to play',
    playTrack: 'tell application "Spotify" to play track "%s"',
    playTrackInContext: 'tell application "Spotify" to play track "%s" in context "%s"',
    playPause: 'tell application "Spotify" to playpause',
    pause: 'tell application "Spotify" to pause',
    next: 'tell application "Spotify" to next track',
    previous: 'tell application "Spotify" to previous track',
    jumpTo: 'tell application "Spotify" to set player position to %s',
    isRunning: 'get running of application "Spotify"',
    isRepeating: 'tell application "Spotify" to return repeating',
    isShuffling: 'tell application "Spotify" to return shuffling',
    setRepeating: 'tell application "Spotify" to set repeating to %s',
    setShuffling: 'tell application "Spotify" to set shuffling to %s',
    toggleRepeating: {
        file: 'toggle_repeating.applescript',
    },
    toggleShuffling: {
        file: 'toggle_shuffling.applescript',
    },
}

// Apple script execution
// ----------------------------------------------------------------------------

var scriptsPath = 'static/scripts/'

var execScript = function(scriptName, params?: any, callback?: any) {
    if (arguments.length === 2 && typeof params === 'function') {
        // second argument is the callback
        callback = params
        params = undefined
    }

    // applescript lib needs a callback, but callback is not always useful
    if (!callback) callback = function() {}

    if (typeof params !== 'undefined' && !Array.isArray(params)) {
        params = [params]
    }

    var script = scripts[scriptName]

    if (typeof script === 'string') {
        if (typeof params !== 'undefined') script = util.format.apply(util, [script].concat(params))
        return applescript.execString(script, callback)
    } else if (script.file) {
        return applescript.execFile(scriptsPath + script.file, callback)
    }
}

var createJSONResponseHandler = function(callback, flag?: any) {
    if (!callback) return null
    return function(error, result) {
        if (!error) {
            try {
                result = JSON.parse(result)
            } catch (e) {
                return callback(e)
            }
            return callback(null, result)
        } else {
            return callback(error)
        }
    }
}

var createBooleanResponseHandler = function(callback) {
    return function(error, response) {
        if (!error) {
            return callback(null, response === 'true')
        } else {
            return callback(error)
        }
    }
}

// API
// ----------------------------------------------------------------------------

// Open track

const openUri = function(uri, callback) {
    return exec('open "' + uri + '"', callback)
}

const playTrack = function(track, callback?) {
    return execScript('playTrack', track, callback)
}

const playTrackInContext = function(track, context, callback) {
    return execScript('playTrackInContext', [track, context], callback)
}

// Playback control

const play = function(callback) {
    return execScript('play', callback)
}

const pause = function(callback) {
    return execScript('pause', callback)
}

const playPause = function(callback) {
    return execScript('playPause', callback)
}

const next = function(callback) {
    return execScript('next', callback)
}

const previous = function(callback) {
    return execScript('previous', callback)
}

const jumpTo = function(position, callback) {
    return execScript('jumpTo', position, callback)
}

const setRepeating = function(repeating, callback) {
    return execScript('setRepeating', repeating, callback)
}

const setShuffling = function(shuffling, callback) {
    return execScript('setShuffling', shuffling, callback)
}

const toggleRepeating = function(callback) {
    return execScript('toggleRepeating', callback)
}

const toggleShuffling = function(callback) {
    return execScript('toggleShuffling', callback)
}

// Volume control

var mutedVolume = null

const volumeUp = function(callback) {
    mutedVolume = null
    return execScript('volumeUp', callback)
}

const volumeDown = function(callback) {
    mutedVolume = null
    return execScript('volumeDown', callback)
}

const setVolume = function(volume, callback) {
    mutedVolume = null
    return execScript('setVolume', volume, callback)
}

const muteVolume = function(callback) {
    return execScript(
        'state',
        createJSONResponseHandler(function(err, state) {
            setVolume(0, callback)
            mutedVolume = state.volume
        })
    )
}

const unmuteVolume = function(callback) {
    if (mutedVolume !== null) {
        return setVolume(mutedVolume, callback)
    }
}

// State retrieval

const getTrack = function(callback) {
    return execScript('track', createJSONResponseHandler(callback, 'track'))
}

const getState = function(callback) {
    return execScript('state', createJSONResponseHandler(callback, 'state'))
}

const isRunning = function(callback) {
    return execScript('isRunning', createBooleanResponseHandler(callback))
}

const isRepeating = function(callback) {
    return execScript('isRepeating', createBooleanResponseHandler(callback))
}

const isShuffling = function(callback) {
    return execScript('isShuffling', createBooleanResponseHandler(callback))
}

export {
    getState,
    playTrack,
    getTrack,
    isRepeating,
    isRunning,
    isShuffling,
    unmuteVolume,
    mutedVolume,
    muteVolume,
    setVolume,
    volumeUp,
    volumeDown,
}
