/**
 * offset all vertices in a geometry (positions) by the given 4x4 matrix
 * this returns a new geometry object, with changed positions
 * @param  {Object} geometry object containing positions data (flat array, flat typed array)
 * @param  {String} transformMat4 the 4x4 transformation matrix
 * @return {Object} the modified geometry with updated positions
 */
export function applyMat4ToGeometry (geometry, transformMat4) {
  const vec3 = require('gl-vec3')

  // matrix
  const {positions} = geometry
  let transformedPositions = new Float32Array(positions.length)

  for (var i = 0; i < positions.length; i += 3) {
    let newPos = vec3.fromValues(positions[i], positions[i + 1], positions[i + 2])
    vec3.transformMat4(newPos, newPos, transformMat4)
    transformedPositions[i] = newPos[0]
    transformedPositions[i + 1] = newPos[1]
    transformedPositions[i + 2] = newPos[2]
  }
  return {...geometry, positions}
}
