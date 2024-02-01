import generatorShaderSource from './shaders/generatorVert.glsl';
import generatorFragmentSource from './shaders/generatorFrag.glsl';
import blurShaderSource from './shaders/blurVert.glsl';
import blurFragmentSource from './shaders/blurFrag.glsl';

import { initShaderProgram } from './utils';

import {
    generateTriangles,
    generateOffsetArray,
    generateBarycentricCoordinates,
    generateMappedTextureCoordinates, 
    generateQuadVertices} from './generators'

// // just to keep our canvas in the center of the doc
// function adjustSquare() {
//     const container = document.querySelector('.square-container');
//     const square = document.querySelector('.square');
    
//     const width = container.clientWidth;
//     const height = container.clientHeight;
//     const size = Math.min(width, height);

//     square.style.width = `${size}px`;
//     square.style.height = `${size}px`;

// }

// window.onload = adjustSquare;
// window.onresize = adjustSquare;

// Get the canvas element and its WebGL context
const canvas = document.getElementById('glCanvas');
const gl     = canvas.getContext('webgl');
// Stop if WebGL is not supported
if (!gl) { alert('Sorry shader cant run here, you dont have webgl :('); }

// parameters
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// triangles initialization
const objectCount               = 2048
const triangleVertices          = generateTriangles(objectCount, "grid");
const offsetArray               = generateOffsetArray(objectCount)
const barycentricCoordinates    = generateBarycentricCoordinates(objectCount)
const textureCoordinates        = generateMappedTextureCoordinates(objectCount)

// this is for the blurring
const quadVertices              = generateQuadVertices();

// instantiate both programs
const generatorProgram = initShaderProgram(gl, generatorShaderSource, generatorFragmentSource);
const blurProgram = initShaderProgram(gl, blurShaderSource, blurFragmentSource);

const programInfo = {
    program : generatorProgram,
    blur    : blurProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(generatorProgram, 'aVertexPosition'),
    },
};

// get all the uniform location
const positionLocation  = gl.getAttribLocation(generatorProgram, "aVertexPosition");
const texcoordLocation  = gl.getAttribLocation(generatorProgram, "aTexcoord");
const uTextureLocation  = gl.getUniformLocation(generatorProgram, "uTexture");

const yearLocation      = gl.getUniformLocation(generatorProgram, 'u_year');
const monthLocation     = gl.getUniformLocation(generatorProgram, 'u_month');
const dayLocation       = gl.getUniformLocation(generatorProgram, 'u_day');
const hourLocation      = gl.getUniformLocation(generatorProgram, 'u_hour');
const minuteLocation    = gl.getUniformLocation(generatorProgram, 'u_minute');
const secondLocation    = gl.getUniformLocation(generatorProgram, 'u_second');
const milliLocation     = gl.getUniformLocation(generatorProgram, 'u_millisecond');

const uBlurTextureLocation = gl.getUniformLocation(blurProgram, "uTexture");
const uResolutionLocation = gl.getUniformLocation(blurProgram, "uResolution");
const uMouseLocation    = gl.getUniformLocation(blurProgram, "uMouse");
const aPositionLocation = gl.getAttribLocation(blurProgram, 'aPosition');
const aTexcoordLocation = gl.getAttribLocation(blurProgram, 'aTexcoord');

let mousePos = { x: 0, y: 0 };

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
});

function getNormalizedMouseCoords() {
    // Convert pixel coordinates to a range of -1 to 1
    // where (-1, -1) is the bottom left corner and (1, 1) is the top right corner of the canvas
    return {
        x: (mousePos.x / canvas.width) * 2 - 1,
        y: (1 - mousePos.y / canvas.height) * 2 - 1
    };
}


function drawScene(gl, programInfo, time) {

    const normalizedMousePos = getNormalizedMouseCoords()

    // Create and bind the framebuffer
    // ---------------------------------------------
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    gl.bindTexture(gl.TEXTURE_2D, blurBufferTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, blurBufferTexture, 0);

    // Clear the canvas
    // ---------------------------------------------
    gl.useProgram(programInfo.program);
    updateTimeUniform(gl);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);  // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);

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
        positionLocation, 
        2, // number of components per attribute
        gl.FLOAT, 
        false, 
        0, 
        0
    );
    gl.enableVertexAttribArray(positionLocation);

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
    const offsetLocation = gl.getAttribLocation(generatorProgram, 'aOffset');
    gl.vertexAttribPointer(offsetLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(offsetLocation);

    // Draw the triangles
    const vertexCount = triangleVertices.length / 2; // Assuming 2 components per vertex position
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

// ------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------

    // Apply blur
    // ---------------------------------------------
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(programInfo.blur);

    // Set the uniforms
    gl.uniform2f(uResolutionLocation, canvas.width, canvas.height);

    // Set the texture as a uniform
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, blurBufferTexture);
    gl.uniform1i(uBlurTextureLocation, 0);

    const quadVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);
    
        // TEMP
    const timeLocation = gl.getUniformLocation(programInfo.blur, 'uTime');
    gl.uniform1f(timeLocation, time / 1000);
    gl.uniform2f(uMouseLocation, normalizedMousePos.x, normalizedMousePos.y);

    // Set up the position attribute

    const stride = 4 * Float32Array.BYTES_PER_ELEMENT; // 4 components per vertex
    gl.enableVertexAttribArray(aPositionLocation);
    gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, stride, 0);

    const texcoordOffset = 2 * Float32Array.BYTES_PER_ELEMENT; // Offset by 2 floats
    gl.enableVertexAttribArray(aTexcoordLocation);
    gl.vertexAttribPointer(aTexcoordLocation, 2, gl.FLOAT, false, stride, texcoordOffset);

    // Draw the quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}

function updateTimeUniform(gl) {

    var now         = new Date();
    var year        = now.getFullYear()
    var month       = now.getMonth()
    var day         = now.getDay()
    var hours       = now.getHours()
    var minutes     = now.getMinutes()
    var seconds     = now.getSeconds()
    var milliseconds= now.getMilliseconds()

    // Set the u_time uniform
    gl.uniform1f(yearLocation,      year        );
    gl.uniform1f(monthLocation,     month       );
    gl.uniform1f(dayLocation,       day         );
    gl.uniform1f(hourLocation,      hours       );
    gl.uniform1f(minuteLocation,    minutes     );
    gl.uniform1f(secondLocation,    seconds     );
    gl.uniform1f(milliLocation,     milliseconds);

}

function render(time) {

    drawScene(gl, programInfo, time);

    // Call render again to animate
    requestAnimationFrame(render);
}

var image = new Image();
var texture = gl.createTexture();
const blurBufferTexture = gl.createTexture();

image.onload = function() {

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
