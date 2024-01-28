// bad procedural triangles
export function generateTriangles(numQuad) {

    const nearestPoT = closestLargerSquarePoT(numQuad)
    const triangleVertices = [];
    const delta = 1 / nearestPoT

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
    

    console.log(offsetArray)

    return offsetArray;
}

// barycentric coordinates of each vertices
export function createBarycentricCoordinates(numQuad) {

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
export function createTextureCoordinates(numQuad) {

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

import { closestLargerSquarePoT } from "./utils";

// texture coordinates for each triangle
export function createMappedtextureCoordinates(numQuad) {

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