/* eslint-disable no-unused-vars */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { ExtendedSpotifyApi, SpotifyAudioAnalysis } from 'utils/types'

export class FilesAPI {
    basepath: string
    spotifyApi: ExtendedSpotifyApi

    constructor(basepath: string, spotifyApi: ExtendedSpotifyApi) {
        this.basepath = basepath.replace('/app.asar/', '/')
        this.spotifyApi = spotifyApi
        if (!existsSync(this.basepath + 'tracks')) {
            mkdirSync(this.basepath + 'tracks')
        }
        if (!existsSync(this.basepath + 'db')) {
            mkdirSync(this.basepath + 'db')
        }
    }

    save(fileName: string, data: string) {
        return writeFileSync(this.basepath + fileName, data, 'utf8')
    }

    load(fileName: string) {
        if (!existsSync(this.basepath + fileName)) {
            return ''
        }
        return readFileSync(this.basepath + fileName, 'utf8').toString()
    }

    exist(fileName: string) {
        return existsSync(this.basepath + fileName)
    }

    async loadTrackAnalysis(id: string): Promise<SpotifyAudioAnalysis> {
        const fName = 'tracks/' + id + '_analysis.json'
        if (!this.exist(fName)) {
            const body = await this.spotifyApi
                .getAudioAnalysisForTrack(id)
                .then(res => res.body)
                .catch(_e => '')
            if (body) {
                this.save(fName, JSON.stringify(body))
                return body as SpotifyAudioAnalysis
            } else {
                return {} as SpotifyAudioAnalysis
            }
        } else {
            return JSON.parse(this.load(fName))
        }
    }
}
