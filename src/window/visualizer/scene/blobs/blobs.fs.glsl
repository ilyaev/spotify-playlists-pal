varying vec3 vUv;
uniform float u_time;
uniform float rad;
uniform vec2 u_resolution;
uniform int u_circles; // 12
uniform float u_size;  // 0.04
uniform float u_volume;

#define PI 3.14159265359

float BLOB_SIZE = 0.7 + u_volume / 15.;
float BLOB_REST = 1.0 - BLOB_SIZE;

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);

	float res = mix(
		mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
		mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}


vec3 getColor(vec2 i_st, vec2 uv) {
    // float r = 0.5 + sin(u_time*10. + uv.x * 3.)*cos(u_time + uv.y * 3.) * 0.5;
    // return vec3(r * u_volume, 0.,0.);
    return vec3(abs(sin(1. + i_st.y + uv.x)), abs(cos(u_time + i_st.x * i_st.y + uv.y)), abs(sin(u_time + i_st.x / i_st.y)));
}

float getMagnitude(vec2 i_st, vec2 uv) {
    // return 1. + float(i_st.x);
    // float sc = distance(uv, vec2(0.))
    return u_volume / 2. + 1. + abs(sin(u_time + i_st.x));// * abs(sin(u_time * 1.)) * 2.));
}

mat2 rotate2d(float angle) {
    return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}


void main() {
    float scale = (5. + pow(u_volume /2. ,2.));
    vec2 shift = vec2(u_time) + vec2(pow(u_volume / 3., 3.));
    shift = vec2(u_time / 2.);
    // scale = 5.;
    vec2 uv = scale * vUv.xy / u_resolution + shift;
    uv.x *= u_resolution.x / u_resolution.y;

    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);

    float m_dist = 2.;
    vec3 color = vec3(0.);
    vec3 c_color = vec3(0.);
    float c_magnitude = 1.;
    float magnitude = 1.;

    // uv = rotate2d(sin(u_time) * pow(u_volume / 3. , 2.)) * uv;

    for(int y = -1; y <= 1 ; y++) {
        for(int x = -1 ; x <= 1 ; x++ ) {
            vec2 neighbour = vec2(float(x), float(y));
            vec2 cell = i_st + neighbour;
            vec2 point = random2(cell);
            // vec2 point = vec2(noise(vec2(u_time + cell.y + 0.01*cell.x, u_time + cell.x + 0.1 * cell.y)), noise(vec2(u_time + cell.x + 0.2 * cell.y, u_time + cell.y + 0.3 * cell.x)));//,random2(cell);
            point = vec2(0.5) + vec2(0.5) * vec2(sin(u_time + vec2(PI * 2.) * point));
            float magnitude = getMagnitude(cell, uv);
            float dist = length(neighbour + point - f_st) / magnitude;

            if (dist < m_dist) {
                m_dist = dist;
                c_color = getColor(cell, uv);
                c_magnitude = magnitude;
            }
        }
    }

    float base = 2.;//10. + sin(u_time * 10.) * 5. + pow(u_volume, 3.);

    color = mix(vec3(0.), c_color, 1.0 - m_dist / c_magnitude);
    // color = c_color; //mix(vec3(0.), c_color, 1.0 - m_dist / c_magnitude);
    color += vec3(step(BLOB_SIZE + noise(vec2(uv.x * base + u_time * 2., uv.y * base + u_time * 2.)) * BLOB_REST, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color = vec3(step(.5, color.r + color.g + color.b));

    // color += vec3(m_dist);
    // color += vec3(step(0.3, m_dist) - step(0.31, m_dist));
    // color += vec3(step(0.75 + abs(sin(u_time + sin(uv.y*uv.x)*2. + cos(uv.y/uv.x) * 2.)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75 + noise(vec2(u_time, 0.75)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(0.75 + noise(vec2((abs(sin(u_time + uv.x))) + uv.x/3. + uv.y*3., uv.y*2. + u_time*2.)) * 0.25, 1.0 - m_dist) - step(0., 1.0 - m_dist));
    // color += vec3(step(BLOB_SIZE + noise(vec2(uv.x * 2. + u_time*2., uv.y*2. + u_time*2.)) * BLOB_REST, 1.0 - m_dist) - step(0., 1.0 - m_dist));

    // color += 1. - step(.01, m_dist);

    // color.r += step(0.99, f_st.x) + step(0.99, f_st.y);

    gl_FragColor = vec4(color, 1.0);


}