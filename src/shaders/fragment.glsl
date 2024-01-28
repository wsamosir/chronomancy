#version 100
precision highp float;

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
    float alpha = smoothstep(0.0, 0.15, edgeDistance);

    float u_time = u_second + u_millisecond / 1000.0;

    vec4 previousColor = texture2D(u_previousFrame, v_texCoord);
    // displacement
    vec2 displacement = vBarycentric.xy * sin(u_time);
    vec2 uv = gl_FragCoord.xy + displacement;

    // Use uv to sample from a texture or calculate color
    // For demonstration, just setting a color based on displacement
    vec4 color = texture2D(uTexture, v_texCoord); // Ensure the color is in the valid range
    vec4 newColor = previousColor * alpha * alpha;
    
    // gl_FragColor = texture2D(uTexture, v_texCoord);


    // float red = abs(sin(u_time) * vPosition.x * alpha);
    // float green = abs(cos(u_time) * vPosition.y * alpha);
    // float blue = abs(tan(u_time) * vPosition.z + alpha);

    // // gl_FragColor = vec4(alpha * red, alpha - green, blue, 1.0);

    // // Use uv to sample from a texture or calculate color
    // // For demonstration, just setting a color based on displacement
    // vec3 color = vec3(displacement, 0.5) + vec3(red, green, blue); // Ensure the color is in the valid range
    // vec4 newColor = (previousColor + vec4(color, 1.0)) * alpha * alpha;
    
    gl_FragColor = newColor;
    
}
