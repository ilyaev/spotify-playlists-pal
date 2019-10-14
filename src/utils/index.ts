export const bem = (parent: string) => (child?: string, params?: any) => {
    return [parent].concat(child ? [child] : []).join('_')
}

export const normalizeSpotifyURI = (uri: string) =>
    uri
        .split(':')
        .slice(-3)
        .map((one, index) => (index === 0 ? 'spotify' : one))
        .join(':')
