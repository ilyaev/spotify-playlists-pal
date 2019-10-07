export const bem = (parent: string) => (child?: string, params?: any) => {
    return [parent].concat(child ? [child] : []).join('_')
}
