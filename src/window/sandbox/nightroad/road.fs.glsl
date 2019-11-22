// precision mediump float;
uniform vec3 uColor;
uniform vec2 uResolution;
uniform float uTime;
varying vec3 vUv;

float PI = 3.14159265358979;
float delimeterSpeed = 30.0;



void main() {

    vec3 colYellow = vec3(0.98, 0.82, 0.39);

    float blink = 1.0; //abs(sin(uTime * 5.0));

    vec2 st = vUv.xy / uResolution.xy + vec2(0.5);

    // vec3 colYellow = vec3(sin(uTime + st.y), 0.0, 0.0);

    // float delimeter = smoothstep(0.996, 0.999 , sin(st.x * PI));
    //       delimeter *= (1.0 - smoothstep(0.1,0.42, sin(uTime * delimeterSpeed + st.y * 3.14 * 30. * 2.)));

    float delimeter = step(0.999 , sin(st.x * PI));
    delimeter *= (1.0 - step(0.5, sin(uTime * delimeterSpeed + st.y * 3.14 * 30. * 2.)));

    gl_FragColor = vec4(vec3(vec3(delimeter * blink)*colYellow + uColor), 1.0);
}