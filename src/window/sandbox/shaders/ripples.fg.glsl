varying vec3 vUv;
uniform float t;
uniform float rad;
uniform vec2 iResolution;

vec2 center = vec2(-0.25 / 20.0,0.25);
float speed = 0.035;

void mainImage( out vec4 fragColor)
{
    float invAr = iResolution.y / iResolution.x;

    vec2 uv = vUv.xy / iResolution.xy;

	vec3 col = vec4(uv,0.7+0.5*sin(t),1.0).xyz;

     vec3 texcol;

	float x = (center.x-uv.x);
	float y = (center.y-uv.y) * invAr;

	//float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
	float r = -(x*x + y*y);
	float z = 1.0 + 0.5*sin((r+t*speed)/0.007);

	texcol.x = z;
	texcol.y = z;
	texcol.z = z;

	fragColor = vec4(col*texcol,1.0);
}


void main() {

	mainImage(gl_FragColor);
	// gl_FragColor = mix(mix(layer1, layer2, layer2.a), layer3, layer3.a);

}
