import vec3 from 'gl-vec3'
import { computeBounds } from '@usco/bounds-utils'

/**
 * apply a 4x4 tranformation matrix (transformation matrix usually) to an AABB
 * (axis aligned bounding box)
 * this does NOT mutate the original data
 * @param  {Object} matrix 4X4 transformation matrix as a flat array/typed array (from gl-mat4 or similar)
 * @param  {Object} aabb the current AABB
 * @return {Object}      the transformed AABB
 */
export default function applyMat4ToAABB (matrix, aabb) {
  /* why does this not work ??
  const min = vec3.transformMat4([], bounds.min, mat)
  const max = vec3.transformMat4([], bounds.max, mat)

  let positions = [
    ...min,
    max[0], min[1], min[2],
    max[0], max[1], min[2],
    min[0], max[1], min[2],

    min[0], min[1], max[2],
    max[0], min[1], max[2],
    ...max,
    min[0], max[1], max[2]
  ]
  return computeBounds({geometry: {positions}})
  */
  const {min, max} = aabb

  let positions = [
    ...min,
    max[0], min[1], min[2],
    max[0], max[1], min[2],
    min[0], max[1], min[2],

    min[0], min[1], max[2],
    max[0], min[1], max[2],
    ...max,
    min[0], max[1], max[2]
  ]

  for (let i = 0; i < positions.length; i += 3) {
    let pos = [positions[i], positions[i + 1], positions[i + 2]]
    pos = vec3.transformMat4([], pos, matrix)
    positions[i] = pos[0]
    positions[i + 1] = pos[1]
    positions[i + 2] = pos[2]
  }

  return computeBounds({geometry: {positions}})
}
