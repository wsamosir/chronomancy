attribute vec4 aVertexPosition;
attribute vec3 aBarycentric; // Barycentric coordinates attribute
attribute vec2 aTexcoord; // Attribute for texture coordinates
attribute vec2 aOffset;

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

float hourCharacteristics(float t) {
    // TODO: how should the multiplier behave at certain hours?
    return t;
}

// variable to consider
// - speed of the changes
// - how align are the waves with each other


void main() {

    vPosition = aVertexPosition; // Pass the position to the varying
    vBarycentric = aBarycentric; // Pass barycentric coordinates
    v_texCoord = aTexcoord;

    // float secondNow = smoothstep(0.0, 60.0, u_second);
    // secondNow = 10.0;

    vec2 normOffset = (aOffset + 1.0)/2.0;
    vec2 stretchedOffset = normOffset * 8.0;

    float millisecondThisHour = u_minute * 60000.0 + u_second * 1000.0 + u_millisecond;
    float msDivisor = 2500.0;

    float secDivisor = 60.0 * msDivisor;
    float hourVar = millisecondThisHour / secDivisor;

    float vecX = aVertexPosition.x;
    float vecY = aVertexPosition.y;

    float u_time = millisecondThisHour / msDivisor;
    
    float sinTime = sin(u_time + 25.0) ;
    float cosTime = cos(u_time) * sin(u_time + 15.0);

    // TODO: vary the alignment of the waves based on uniform
    sinTime = sinTime + sin(u_time * 1.5) + sin(u_time * 0.7 + 5.0);
    cosTime = cosTime + cos(u_time * 0.5 + 5.0) + cos(u_time * 1.0 + 15.0);

    // sinTime = sinTime / 3.0;
    // cosTime = cosTime / 3.0;

    float distToCenter = dot(aVertexPosition.xy, aOffset.xy) + 0.2;

    vec2 spin = vec2(sinTime * distToCenter, cosTime * distToCenter);

    float offsetDivisorX = 1.0 - abs(aOffset.x) * 0.5;
    float offsetDivisorY = 1.0 - abs(aOffset.y) * 0.5;

    // TODO: vary the speed based on uniform
    float varXoffset = sin(u_time + spin.x * 15.0 + 25.0 + stretchedOffset.x);
    float varYoffset = cos(u_time + spin.y * 15.0 + stretchedOffset.y);
    
    // varXoffset = (varXoffset + sin(aVertexPosition.x)) * 0.5;
    // varYoffset = (varYoffset + cos(aVertexPosition.y)) * 0.5;


    
    float posX = varXoffset * (vecX * vecY + (offsetDivisorY * spin.y)) / 2.0;
    float posY = varYoffset * (vecY * vecX + (offsetDivisorX * spin.x)) / 2.0;

    gl_Position = vec4(posX, posY, aVertexPosition.z, 1.0);
    // gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, aVertexPosition.z, 1.0);
}