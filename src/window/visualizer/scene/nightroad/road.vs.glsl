uniform float uTravelLength;
uniform float uTime;
varying vec3 vUv;
// distortion

void main() {

    vUv = position;

    vec3 transformed = position.xyz;

    float progress = (transformed.y + uTravelLength / 2.0) / uTravelLength;
    vec3 distortion = getDistortion(progress);

    transformed.x += distortion.x;
    transformed.z += distortion.y;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed.xyz, 1.0);
}