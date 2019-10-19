export const bem = (parent: string) => (child?: string, params?: any) => {
    const res = [parent].concat(child ? [child] : [])
    const first = res.join('_')
    params &&
        Object.keys(params).forEach(param => {
            params[param] && res.push(param)
        })
    return params ? first + ' ' + res.join('_') : first
}

export const normalizeSpotifyURI = (uri: string) =>
    uri
        .split(':')
        .slice(-3)
        .map((one, index) => (index === 0 ? 'spotify' : one))
        .join(':')

export const waitForTime = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
