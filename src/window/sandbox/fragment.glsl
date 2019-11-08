uniform vec3 colorA;
uniform vec3 colorB;
uniform float t;
varying vec3 vUv;

void main() {
    // gl_FragColor = vec4(mix(colorA, colorB, vUv.x), 1.0);
    gl_FragColor = vec4(cos(vUv.y * t), cos(vUv.x  * t), sin(t + vUv.y * t), 1);
}