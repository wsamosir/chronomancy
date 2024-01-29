// Vertex shader
attribute vec4 aPosition;   // Vertex position
attribute vec2 aTexcoord;   // Texture coordinate

varying vec2 vTexcoord;     // Pass texture coordinate to fragment shader

void main() {
    gl_Position = aPosition; // Set the position
    vTexcoord   = aTexcoord; // Pass the texture coordinate to the fragment shader
}
