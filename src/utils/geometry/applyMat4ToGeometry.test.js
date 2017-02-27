import test from 'ava'
import applyMat4ToGeometry from './applyMat4ToGeometry'

import mat4 from 'gl-mat4'

test('applyMat4ToGeometry', t => {
  const geometry = {positions: [1, -1, 6, -1, 6, 28], normals: [0, 2, 1]}
  const transforms = mat4.create()

  const updatedGeometry = applyMat4ToGeometry(geometry, transforms)
  const expUpdatedGeometry = {positions: [0, -5, 2, -2, 2, 24], normals: [0, 2, 1]}

  t.deepEqual(updatedGeometry, expUpdatedGeometry)
})
