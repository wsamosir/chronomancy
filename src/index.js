import vertexShaderSource from './shaders/vertex.glsl';
import fragmentShaderSource from './shaders/fragment.glsl';

// Get the canvas element and its WebGL context
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl');

function createRandomTriangles(numTriangles) {
    const vertices = [];
    for (let i = 0; i < numTriangles; i++) {

        var x = i / 200 - 1
        var delta = 1 / 200

        vertices.push(x)
        vertices.push(x)

        vertices.push(x + delta * Math.random())
        vertices.push(x * Math.random())
        
        vertices.push(x + delta * Math.random())
        vertices.push(x + delta * Math.random())   

    }
    return vertices;
}

function createBarycentricCoordinates(numTriangles) {

    const barycentrics = []

    for (let i = 0; i < numTriangles; i++) {
        // Generate random vertices for each triangle
        barycentrics.push(...[1.0, 0.0, 0.0])
        barycentrics.push(...[0.0, 1.0, 0.0])
        barycentrics.push(...[0.0, 0.0, 1.0])

    }

    return barycentrics
}

const numTriangles = 200
const triangleVertices = createRandomTriangles(numTriangles);
const barycentricCoordinates = createBarycentricCoordinates(numTriangles)
console.log(barycentricCoordinates)
// Stop if WebGL is not supported
if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);

    // Bind and set up the position buffer
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

    // Draw the triangles
    const vertexCount = triangleVertices.length / 2; // Assuming 2 components per vertex position
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
}

const u_timeLocation = gl.getUniformLocation(shaderProgram, 'u_time');

function render(time) {
    // Convert time to seconds
    time *= 0.005; // convert time to seconds
    // Set the u_time uniform
    gl.uniform1f(u_timeLocation, time);

    drawScene(gl, programInfo);

    // Call render again to animate
    requestAnimationFrame(render);
}

// Start the animation loop
requestAnimationFrame(render);

