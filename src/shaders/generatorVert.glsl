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

vec2 rotate(vec2 point, float angle) {
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    return vec2(
        point.x * cosAngle - point.y * sinAngle,
        point.x * sinAngle + point.y * cosAngle
    );
}

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
    vec2 stretchedOffset = normOffset * 16.0;

    float millisecondThisHour = u_minute * 60000.0 + u_second * 1000.0 + u_millisecond;
    float msDivisor = 5000.0;

    float secDivisor = 60.0 * msDivisor;
    float hourVar = millisecondThisHour / secDivisor;

    float vecX = aVertexPosition.x;
    float vecY = aVertexPosition.y;

    float u_time = millisecondThisHour / msDivisor;
    
    float sinTime = sin(u_time + 25.0) ;
    float cosTime = cos(u_time);

    // TODO: vary the alignment of the waves based on uniform
    sinTime = sinTime + sin(u_time * 1.5) + cos(u_time * 0.7 + 5.0);
    cosTime = cosTime + sin(u_time * 0.5 + 5.0) + cos(u_time * 1.0 + 15.0);
    
    // sinTime = 1.0 - sinTime * 0.5;
    // cosTime = 1.0 - cosTime * 0.5;

    float distToCenter = length(aVertexPosition.xy);

    vec2 spin = vec2(sinTime * distToCenter ,  cosTime * distToCenter );

    float offsetDivisorX = 1.0 - abs(aOffset.x) * 0.9;
    float offsetDivisorY = 1.0 - abs(aOffset.y) * 0.9;

    spin = rotate(spin, distToCenter * distToCenter * 2.0 + u_time);
    // TODO: vary the speed based on uniform
    float varXoffset = sin(u_time + spin.x * 35.0 + 25.0 + stretchedOffset.x);
    float varYoffset = cos(u_time + spin.y * 15.0 + stretchedOffset.y);
    
    float posX  = varXoffset * (vecX * vecY + (offsetDivisorY * spin.y)) / 2.0;
    float posY  = varYoffset * (vecY * vecX + (offsetDivisorX * spin.x)) / 2.0;

    vec2 final = rotate(vec2(posX, posY), exp(distToCenter) * 2.0 + u_time);

    gl_Position = vec4(final.x, final.y, aVertexPosition.z, 1.0);

}