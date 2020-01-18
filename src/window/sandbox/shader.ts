import { ThreeScene } from '../visualizer/scene/base'
import { TrackSync } from 'utils/track'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
// import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { Uniform, Color, Vector2 } from 'three'

export class SandboxScene extends ThreeScene {
    track: TrackSync
    composer: EffectComposer
    colorPass: ShaderPass

    build() {
        this.composer = new EffectComposer(this.renderer)
        // this.composer.addPass(new RenderPass(this.scene, this.camera))

        const canvas = this.renderer.domElement

        const resolution = new Vector2(canvas.width, canvas.height)

        const colorShader = {
            uniforms: {
                tDiffuse: { value: null },
                color: { value: new Color(0x88ccff) },
                u_time: new Uniform(0),
                u_resolution: { type: 'vec2', value: resolution },
            },
            vertexShader: `
              varying vec2 vUv;
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
              }
            `,
            fragmentShader: `
              uniform vec3 color;
              uniform sampler2D tDiffuse;
              varying vec2 vUv;
              uniform float u_time;
              uniform vec2 u_resolution;

              const int POINTS = 8;

              #define PI 3.14159265359

                float GLOW = 0.9;

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

                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
                vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}

                float cpnoise(vec2 P){
                vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
                vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
                Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
                vec4 ix = Pi.xzxz;
                vec4 iy = Pi.yyww;
                vec4 fx = Pf.xzxz;
                vec4 fy = Pf.yyww;
                vec4 i = permute(permute(ix) + iy);
                vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
                vec4 gy = abs(gx) - 0.5;
                vec4 tx = floor(gx + 0.5);
                gx = gx - tx;
                vec2 g00 = vec2(gx.x,gy.x);
                vec2 g10 = vec2(gx.y,gy.y);
                vec2 g01 = vec2(gx.z,gy.z);
                vec2 g11 = vec2(gx.w,gy.w);
                vec4 norm = 1.79284291400159 - 0.85373472095314 *
                    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
                g00 *= norm.x;
                g01 *= norm.y;
                g10 *= norm.z;
                g11 *= norm.w;
                float n00 = dot(g00, vec2(fx.x, fy.x));
                float n10 = dot(g10, vec2(fx.y, fy.y));
                float n01 = dot(g01, vec2(fx.z, fy.z));
                float n11 = dot(g11, vec2(fx.w, fy.w));
                vec2 fade_xy = fade(Pf.xy);
                vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
                float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
                return 2.3 * n_xy;
                }

              vec3 getPoint(vec2 uv, float radius, vec2 center, int index) {
                float dist = radius / distance(uv, center);
                float c = pow(dist, 1.0/GLOW);
                float r = noise(vec2(u_time, float(index + POINTS) + 0.5));// 0.6;
                // float g = noise(vec2(u_time, float(index + POINTS) + 1.5)); //0.4;
                // float b = noise(vec2(u_time, float(index + POINTS) + 2.5));//0.4;
                // float r = 0.6;
                float g = 0.3;
                float b = 0.4;
                vec3 color = vec3(r, g, b);
                return vec3(c) * color;
            }


              void main() {
                vec4 previousPassColor = texture2D(tDiffuse, vUv);

                vec2 uv = vUv; //.xy / u_resolution;
                uv.x *= u_resolution.x / u_resolution.y;
                uv.y -= 0.5;
                uv.x -= 0.5 * u_resolution.x / u_resolution.y;

                vec3 color = vec3(0.,0.,0.);

                float radius = 0.03;
                float scale = 1.;

                for (int i = 0 ; i < POINTS ; ++i) {

                    radius = noise(vec2(u_time, 567.5 + float(i*2))) * 0.05;

                    float px = cpnoise(vec2(float(i*2) + sin(u_time) + 0.5, float(i*2 + 1) + cos(u_time) + 0.5)) * scale;
                    float py = cpnoise(vec2(float(i*2 + 100) + sin(u_time) + 0.5, float(i*2 + 100) + cos(u_time) + 0.5)) * scale;

                    color = color + getPoint(uv, radius, vec2(px, py), i);

                }

                color += getPoint(uv, radius, vec2(0.,0.), 1);

                gl_FragColor = vec4(
                    color,
                    previousPassColor.a);
              }
            `,
        } as any

        this.colorPass = new ShaderPass(colorShader)
        this.colorPass.renderToScreen = true
        this.composer.addPass(this.colorPass)

        this.composer.setSize(canvas.width, canvas.height)
    }

    onEnter() {}

    // onBeat(beat: any) {}

    update(now: number) {
        const t = now / 1000
        this.composer.render()
        const uniforms = this.colorPass.uniforms as any
        uniforms.u_time.value = t
    }
}
