import { SPOTIFY_CLIENT_ID } from '../env'
import { SPOTIFY_CALLBACK_URL } from './const'
import spotifyMac from 'spotify-node-applescript'
import { builder as webApiBuilder } from 'spotify-web-api-node/src/webapi-request'
import HttpManager from 'spotify-web-api-node/src/http-manager'
import SpotifyWebApi from 'spotify-web-api-node'
import { FilesAPI } from './files'
import { ExtendedSpotifyApi } from 'utils/types'
import { app } from 'electron'

const spotifyApi = Object.assign(
    new SpotifyWebApi({
        clientId: SPOTIFY_CLIENT_ID,
        redirectUri: SPOTIFY_CALLBACK_URL,
    }),
    {
        get: <T>(url: string, params: any = {}): Promise<T> =>
            new Promise((resolve, reject) =>
                webApiBuilder(spotifyApi.getAccessToken())
                    .withPath('/v1/' + url)
                    .withQueryParameters(params)
                    .build()
                    .execute(HttpManager.get, (event, response) => {
                        if (!response || !response.statusCode || response.statusCode !== 200) {
                            reject({ event, response })
                        } else {
                            resolve(response.body as T)
                        }
                    })
            ),
    }
) as ExtendedSpotifyApi

const filesApi = new FilesAPI(app.getAppPath() + '/', spotifyApi)

export { spotifyMac, spotifyApi, filesApi }
