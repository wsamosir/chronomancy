import { closestLargerSquarePoT } from "./utils";

export function generateQuadVertices() {
    return new Float32Array([
        // Positions   // Texture Coords
        -1.0, -1.0,    0.0, 0.0, // bottom left
         1.0, -1.0,    1.0, 0.0, // bottom right
        -1.0,  1.0,    0.0, 1.0, // top left
        -1.0,  1.0,    0.0, 1.0, // top left (again)
         1.0, -1.0,    1.0, 0.0, // bottom right (again)
         1.0,  1.0,    1.0, 1.0  // top right
    ]);
}

// bad procedural triangles
export function generateTriangles(numQuad, type) {

    const nearestPoT = closestLargerSquarePoT(numQuad)
    const triangleVertices = [];
    const delta = 1 / nearestPoT * 5

    if (type == "random") {

        for (let i = 0; i < numQuad; i++) {

            // map i to the index of a PoT, returning x and y coordinate of i
            var x = (i % nearestPoT) / nearestPoT - 0.5
            var y = (Math.floor(i / nearestPoT)) / nearestPoT - 0.5

            // generate random points within the quad
            var x1 = x + Math.random() * delta
            var y1 = y + Math.random() * delta

            var x2 = x + Math.random() * delta
            var y2 = y + Math.random() * delta

            var x3 = x + Math.random() * delta
            var y3 = y + Math.random() * delta

            var x4 = x + Math.random() * delta
            var y4 = y + Math.random() * delta

            // as per triangle winding, push in order!
            triangleVertices.push(...[x1, y1])
            triangleVertices.push(...[x2, y2])
            triangleVertices.push(...[x3, y3])

            triangleVertices.push(...[x2, y2])
            triangleVertices.push(...[x3, y3])
            triangleVertices.push(...[x4, y4])



        }

    } else if (type == "grid") {

        for (let i = 0; i < numQuad; i++) {

            // map i to the index of a PoT, returning x and y coordinate of i
            var x = (i % nearestPoT) / nearestPoT - 0.5
            var y = (Math.floor(i / nearestPoT)) / nearestPoT - 0.5

            var corner1 = [x, y]
            var corner2 = [x + delta, y]
            var corner3 = [x, y + delta]
            var corner4 = [x + delta, y + delta]
            
            // as per triangle winding, push in order!
            triangleVertices.push(...corner1)
            triangleVertices.push(...corner2)
            triangleVertices.push(...corner3)

            triangleVertices.push(...corner2)
            triangleVertices.push(...corner3) 
            triangleVertices.push(...corner4)

        }
    }

    return triangleVertices;
}

export function generateOffsetArray(numQuad) {
    
    const nearestPoT = closestLargerSquarePoT(numQuad)
    const offsetArray = []

    for (let i = 0; i < numQuad; i++) {

        var xOffset = ((i % nearestPoT) - nearestPoT / 2) / nearestPoT * 2
        var yOffset = ((Math.floor(i / nearestPoT)) - nearestPoT / 2) / nearestPoT * 2
    
        for (let j = 0; j < 6; j++) {
            offsetArray.push(...[xOffset, yOffset])
            offsetArray.push(...[xOffset, yOffset])
        }
    }
    
    return offsetArray;
    
}

// barycentric coordinates of each vertices
export function generateBarycentricCoordinates(numQuad) {

    const barycentrics = []

    for (let i = 0; i < numQuad; i++) {

        // generate barycentric coordinates for each triangle

        barycentrics.push(...[1.0, 0.0, 0.0])
        barycentrics.push(...[0.0, 1.0, 0.0])
        barycentrics.push(...[0.0, 0.0, 1.0])

        barycentrics.push(...[1.0, 0.0, 0.0])
        barycentrics.push(...[0.0, 1.0, 0.0])
        barycentrics.push(...[0.0, 0.0, 1.0])

    }

    return barycentrics
}

// texture coordinates for each triangle
export function generateTextureCoordinates(numQuad) {

    const texCoords = []

    for (let i = 0; i < numQuad; i++) {

        texCoords.push(...[0.0, 0.0])
        texCoords.push(...[0.0, 1.0])
        texCoords.push(...[1.0, 0.0])

        texCoords.push(...[1.0, 1.0])
        texCoords.push(...[0.0, 1.0])
        texCoords.push(...[1.0, 0.0])

    }

    return texCoords
}

// texture coordinates for each triangle
export function generateMappedTextureCoordinates(numQuad) {

    const nearestPoT = closestLargerSquarePoT(numQuad)
    const texCoords = []
    const delta = 1 / nearestPoT

    for (let i = 0; i < numQuad; i++) {

        // map i to the index of a PoT, returning x and y coordinate of i

        var u = (i % nearestPoT) / nearestPoT
        var v = (Math.floor(i / nearestPoT)) / nearestPoT
                
        // order of triangle is the same as the plane constructor
        // vertex 1,2,3 and then 2,3,4
        texCoords.push(...[u, v])
        texCoords.push(...[u + delta, v])
        texCoords.push(...[u, v + delta])

        texCoords.push(...[u + delta, v])
        texCoords.push(...[u, v + delta])
        texCoords.push(...[u + delta, v + delta])

    }
    return texCoords
}