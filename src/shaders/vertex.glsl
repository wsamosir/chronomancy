attribute vec4 aVertexPosition;
attribute vec3 aBarycentric; // Barycentric coordinates attribute
precision mediump float;

uniform float u_time;
varying vec4 vPosition;
varying vec3 vBarycentric;   // Pass to fragment shader

void main() {
    vPosition = aVertexPosition; // Pass the position to the varying
    vBarycentric = aBarycentric; // Pass barycentric coordinates

    float posX = aVertexPosition.x * cos(u_time * aVertexPosition.y);
    float posY = aVertexPosition.y * sin(u_time * aVertexPosition.y);
    gl_Position = vec4(posX, posY, aVertexPosition.z, 1.0);
}