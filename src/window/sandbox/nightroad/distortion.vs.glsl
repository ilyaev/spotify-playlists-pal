uniform vec2 uDistortionX;
uniform vec2 uDistortionY;
#ifdef uTime
uniform float uTime;
#endif
uniform float uCameraSpeed;

float PI = 3.14159265358979;

float nsin(float val) {
    return sin(val) * 0.5 + 0.5;
}

vec3 getDistortion(float progress) {
    progress = clamp(progress, 0.0, 1.0);
    float xAmp = uDistortionX.r;
    float xFreq = uDistortionX.g;
    float yAmp = uDistortionY.r;
    float yFreq = uDistortionY.g;

    float shift = uTime * uCameraSpeed;

    return vec3(xAmp * nsin(shift + progress * PI * xFreq - PI / 2.0), yAmp * nsin(shift + progress * PI * yFreq - PI / 2.0), 0.0);

}