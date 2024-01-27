#version 100
precision mediump float;

uniform float u_time;
varying vec4 vPosition;
varying vec3 vBarycentric;

void main() {

    float edgeDistance = min(min(vBarycentric.x, vBarycentric.y), vBarycentric.z);
    float alpha = smoothstep(0.0, 0.5, edgeDistance);

    float red = abs(sin(u_time) * vPosition.x * alpha);
    float green = abs(cos(u_time) * vPosition.y * alpha);
    float blue = abs(tan(u_time) * vPosition.z + alpha);

    gl_FragColor = vec4(alpha * red, alpha - green, blue, 1.0);
}
