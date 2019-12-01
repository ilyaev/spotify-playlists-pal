uniform vec3 uColor;
varying vec3 vUv;
uniform float uTravelLength;

void main() {

    float fade = clamp(uTravelLength / 400.0, 0., 1.);

    vec3 color = vec3(uColor) * fade;
    gl_FragColor = vec4(color, 1.0);
}