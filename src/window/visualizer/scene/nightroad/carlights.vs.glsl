attribute vec3 aOffset;
attribute vec2 aMetrics;
uniform float uTime;
uniform float uSpeed;
uniform float uTravelLength;
varying vec3 vUv;
// distortion

void main() {

    vUv = position;

    vec3 transformed = position.xyz;

    float radius = aMetrics.r;
    float len = aMetrics.g;

    transformed.xy *= radius;
    transformed.z *= len;

    float zOffset = uTime * uSpeed + aOffset.z;

    zOffset = len - mod(zOffset, uTravelLength);

    transformed.z = transformed.z + zOffset;
    transformed.xy += aOffset.xy;

    float progress = abs(transformed.z / uTravelLength);
    transformed.xyz += getDistortion(progress);

    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);

    gl_Position = projectionMatrix * mvPosition;

}