const distortion = require('./distortion.vs.glsl')

export const withDistortion = (shader: string) => {
    return shader.replace('// distortion', distortion)
}
