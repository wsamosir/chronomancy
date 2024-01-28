import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';
import { createFramebuffer } from './utils';
import {
    generateTriangles,
    generateOffsetArray,
    createBarycentricCoordinates,
    createMappedtextureCoordinates } from './constructors'

// Get the canvas element and its WebGL context
const canvas = document.getElementById('glCanvas');
const gl     = canvas.getContext('webgl');

// parameters
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// triangles initialization
const objectCount = 4096
const triangleVertices          = generateTriangles(objectCount);
const offsetArray               = generateOffsetArray(objectCount)
const barycentricCoordinates    = createBarycentricCoordinates(objectCount)
const textureCoordinates        = createMappedtextureCoordinates(objectCount)

var texture
// Stop if WebGL is not supported
if (!gl) {
    alert('Sorry shader cant run here, you dont have webgl :(');
}

const vsSource = vertexShaderSource;
const fsSource = fragmentShaderSource;

// Initialize a shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
};

function drawScene(gl, programInfo) {

    // Swap the framebuffers
    let temp = fbA
    fbA = fbB
    fbB = temp

    // // Render final output to screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.uniform1i(shaderProgram.u_previousFrame, fbA.texture);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    // Bind and set up the texture coordinate buffer
    // ---------------------------------------------
    const texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    // Bind the texture coordinate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texcoordLocation);

    // Set the texture
    gl.activeTexture(gl.TEXTURE0); // Use texture unit 0
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uTextureLocation, 0); // Tell the shader we bound the texture to texture unit 0


    // Bind and set up the position buffer
    // ---------------------------------------------
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition, 
        2, // number of components per attribute
        gl.FLOAT, 
        false, 
        0, 
        0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);


    // Bind and set up the barycentric buffer
    // ---------------------------------------------
    const barycentricBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, barycentricBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(barycentricCoordinates), gl.STATIC_DRAW);
    const barycentricLocation = gl.getAttribLocation(programInfo.program, 'aBarycentric');
    gl.vertexAttribPointer(
        barycentricLocation, 
        3, // number of components per attribute
        gl.FLOAT, 
        false, 
        0, 
        0
    );
    gl.enableVertexAttribArray(barycentricLocation);

    // Bind and set up the index buffer
    // ---------------------------------------------
    const offsetBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, offsetBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(offsetArray), gl.STATIC_DRAW);
    const offsetLocation = gl.getAttribLocation(shaderProgram, 'aOffset');
    gl.vertexAttribPointer(offsetLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(offsetLocation);

    // Draw the triangles
    const vertexCount = triangleVertices.length / 2; // Assuming 2 components per vertex position
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

}

const texcoordLocation  = gl.getAttribLocation(shaderProgram, "aTexcoord");
const uTextureLocation  = gl.getUniformLocation(shaderProgram, "uTexture");

const yearLocation      = gl.getUniformLocation(shaderProgram, 'u_year');
const monthLocation     = gl.getUniformLocation(shaderProgram, 'u_month');
const dayLocation       = gl.getUniformLocation(shaderProgram, 'u_day');
const hourLocation      = gl.getUniformLocation(shaderProgram, 'u_hour');
const minuteLocation    = gl.getUniformLocation(shaderProgram, 'u_minute');
const secondLocation    = gl.getUniformLocation(shaderProgram, 'u_second');
const milliLocation      = gl.getUniformLocation(shaderProgram, 'u_millisecond');

let fbA = createFramebuffer(gl).framebuffer;
let fbB = createFramebuffer(gl).framebuffer;

// Create framebuffer and texture
let fbo = createFramebuffer(gl);
let sampleTexture = fbo.texture;

function render(time) {

    var now    = new Date();

    var year = now.getFullYear()
    var month = now.getMonth()
    var day = now.getDay()
    var hours = now.getHours()
    var minutes = now.getMinutes()
    var seconds = now.getSeconds()
    var milliseconds = now.getMilliseconds()

    // Set the u_time uniform
    gl.uniform1f(yearLocation, year);
    gl.uniform1f(monthLocation, month);
    gl.uniform1f(dayLocation, day);
    gl.uniform1f(hourLocation, hours);
    gl.uniform1f(minuteLocation, minutes);
    gl.uniform1f(secondLocation, seconds);
    gl.uniform1f(milliLocation, milliseconds);


    drawScene(gl, programInfo);



    // Call render again to animate
    requestAnimationFrame(render);
}

var image = new Image();
image.onload = function() {

    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    // Upload the image into the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // Start the animation loop
    requestAnimationFrame(render);
    // You might want to call your render function here
};
image.src = 'public/assets/flowers.jpg'; // Set the path to your image



