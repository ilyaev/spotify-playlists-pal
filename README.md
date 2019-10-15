# Spotify Desktop Companion

Tray application to quickly switch between spotify lists

# Config

Register Spotify App [Here](https://developer.spotify.com/dashboard/applications). In `src/env.ts` file update spotify client ID and URL to spotify auth server:

Add `http://127.0.0.1/` to allowed redirect URL's in registered spotify application settings

Setup spotify Auth server somewhere. You can use one in `server` folder and use ip/domain and port in `src/env.ts` configuration. Update `server/server.env.js` file with you spotify app client id and secret

# Install dependencies

- `yarn` or `npm i`

# Build

- `yarn build` or `npm run build` - build
- `yarn dev` or `npm run dev` - build&watch

# Run

- `yarn start` or `npm run start`
- `yarn run run` or `npm run run` - run in DEV mode

# Release

- `yarn dist` or `npm run dist` - build MacOS dmg (see `dist` folder)
- `yarn app` or `npm run app` - start MacOS app from dmg
