attribute vec4 aVertexPosition;
attribute vec3 aBarycentric; // Barycentric coordinates attribute
attribute vec2 aTexcoord; // Attribute for texture coordinates

precision highp float;

uniform float u_year;
uniform float u_month;
uniform float u_day;
uniform float u_hour;
uniform float u_minute;
uniform float u_second;
uniform float u_millisecond;

varying vec4 vPosition;
varying vec3 vBarycentric;   // Pass to fragment shader
varying vec2 v_texCoord;  // Varying to pass the texture coordinates to the fragment shader


float easeInOutQuad(float t) {
    return t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
}

float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
}

void main() {

    vPosition = aVertexPosition; // Pass the position to the varying
    vBarycentric = aBarycentric; // Pass barycentric coordinates
    v_texCoord = aTexcoord;

    float millisecondToday = u_hour * 3600000.0 + u_minute * 60000.0 + u_second * 1000.0 + u_millisecond;
    float msDivisor = 1000.0;

    float vecX = aVertexPosition.x;
    float vecY = aVertexPosition.y;

    float u_time = millisecondToday / msDivisor;
    
    float sinTime = sin(u_time + 25.0 ) ;
    float cosTime = cos(u_time) * sin(u_time + 15.0);

    sinTime = sinTime + sin(u_time * 0.5) + sin(u_time * 0.3 + 5.0);
    cosTime = cosTime + cos(u_time * 0.3 + 5.0) + cos(u_time * 1.0 + 15.0);

    float distToCenter = dot(aVertexPosition.xy, aVertexPosition.xy) + 0.02;

    vec2 spin = vec2(sinTime * distToCenter, cosTime * distToCenter) * 2.0;

    float varXoffset = sin(u_time + spin.x * 10.0 + 25.0) * distToCenter + spin.x;
    float varYoffset = cos(u_time * distToCenter + spin.y * 15.0) * distToCenter + spin.y;

    float posX = (vecX) * varXoffset * 1.0 ;
    float posY = (vecY) * varYoffset * 1.0 ;

    gl_Position = vec4(posX, posY, aVertexPosition.z, 1.0);
    // gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
}