export function createFramebuffer(gl) {
    // Create and bind the framebuffer
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

    // Create a texture to store the framebuffer's color data
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set up texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Define the size and format of the texture
    const width = gl.canvas.width;
    const height = gl.canvas.height;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    // Attach the texture as the first color attachment
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // Check if the framebuffer is complete
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        console.error('Framebuffer is not complete');
    }

    // Unbind the texture and framebuffer
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {
        framebuffer: framebuffer,
        texture: texture
    };
}

export function nearestLowerPowerOfTwo(number) {
    let power = 1;
    while (power * 2 <= number) {
        power *= 2;
    }
    return power;
}

export function closestLargerSquarePoT(number) {
    let pot = 1;
    while (pot * pot < number) {
        pot *= 2;
    }
    return pot;
}