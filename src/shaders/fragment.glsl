#version 100
precision highp float;

const int NUM_SAMPLES = 100;

varying vec4 vPosition;
varying vec3 vBarycentric;

uniform float u_year;
uniform float u_month;
uniform float u_day;
uniform float u_hour;
uniform float u_minute;
uniform float u_second;
uniform float u_millisecond;

uniform sampler2D u_previousFrame;
varying vec2 v_texCoord; // Texture coordinate
uniform sampler2D uTexture;  // The texture

void main() {

    float edgeDistance = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
    float alpha = smoothstep(0.0, 0.0, edgeDistance);

    float u_time = u_second + u_millisecond / 1000.0;

    vec4 previousColor = texture2D(u_previousFrame, v_texCoord);
    // displacement
    vec2 displacement = vBarycentric.xy * sin(u_time);
    vec2 uv = gl_FragCoord.xy + displacement;

    // Use uv to sample from a texture or calculate color
    // For demonstration, just setting a color based on displacement
    vec4 color = texture2D(uTexture, v_texCoord); // Ensure the color is in the valid range
    vec4 newColor = previousColor;
    
    // gl_FragColor = texture2D(uTexture, v_texCoord);

// ---------------------------------------
    vec2 motionVector = vec2(0.05, 0.05);
    vec4 blurColor = texture2D(u_previousFrame, v_texCoord);

    // Simple motion blur: Average the color along the motion vector
    for (int i = 1; i <= NUM_SAMPLES; ++i) {
        vec2 sampleCoord = v_texCoord + motionVector * (float(i) /float( NUM_SAMPLES));
        blurColor += texture2D(u_previousFrame, sampleCoord);
    }

    blurColor /= float(NUM_SAMPLES + 1);
// ---------------------------------------



    float red = abs(sin(u_time) * vPosition.x * alpha);
    float green = abs(cos(u_time) * vPosition.y * alpha);
    float blue = abs(sin(u_time) + alpha);

    gl_FragColor = vec4(red, alpha - green, blue, alpha);

    // // Use uv to sample from a texture or calculate color
    // // For demonstration, just setting a color based on displacement
    // vec3 color = vec3(displacement, 0.5) + vec3(red, green, blue); // Ensure the color is in the valid range
    // vec4 newColor = (previousColor + vec4(color, 1.0)) * alpha * alpha;
    
    gl_FragColor = newColor;
    

    
}
