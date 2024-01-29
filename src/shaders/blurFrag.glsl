// Fragment shader
precision mediump float;
const int NUM_SAMPLES = 25; // Number of samples for the blur

uniform vec2 uResolution; // The resolution (width and height) of the viewport or framebuffer
uniform sampler2D uTexture;       // The rendered scene texture
uniform vec2 uMouse;              // Mouse position
uniform float uTime;              // Time in seconds since load

varying vec2 vTexcoord;           // Texture coordinate

vec2 rotate(vec2 point, float angle) {
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    return vec2(
        point.x * cosAngle - point.y * sinAngle,
        point.x * sinAngle + point.y * cosAngle
    );
}

void main() {

    vec2 pixelPosition = gl_FragCoord.xy;

    // Rotate the pixel position
    // pixelPosition = rotate(pixelPosition, uTime);

    vec2 normalizedPosition = gl_FragCoord.xy / uResolution * 2.0 - 1.0;
    normalizedPosition = rotate(normalizedPosition, uTime);
    vec2 motionVector = normalizedPosition; // Motion vector
    
    // motionVector = (motionVector - uMouse) / 2.0; // Subtract the mouse position and scale down
    vec2 inverse = vec2(1.0, 1.0) - abs(normalizedPosition);
    motionVector = motionVector * motionVector  / 3.0 * (inverse);
    vec4 color = texture2D(uTexture, vTexcoord); // Initial color

    for (int i = 1; i < NUM_SAMPLES; i++) {
        vec2 samplePos = vTexcoord + motionVector * (float(i) / float(NUM_SAMPLES));
        color += texture2D(uTexture, samplePos);
    }

    color /= float(NUM_SAMPLES); // Average the color
    gl_FragColor = color;        // Set the final color
    
}
