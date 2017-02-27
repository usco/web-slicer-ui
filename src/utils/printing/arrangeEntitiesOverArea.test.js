import test from 'ava'
import arrangeEntitiesOverArea from './arrangeEntitiesOverArea'

test('arrangeEntitiesOverArea', t => {
  const entities = [
    {
      geometry: {positions: [1, -1, 6, -1, 6, 28], normals: [0, 2, 1]},
      transforms: {pos: [0, 0, 0], rot: [0, 0, 0], sca: [1, 1, 1]},
      bounds: {}
    },
    {
      geometry: {positions: [1, -1, 6, -1, 6, 28], normals: [0, 2, 1]},
      transforms: {pos: [0, 0, 0], rot: [0, 0, 0], sca: [1, 1, 1]},
      bounds: {}
    }
  ]

  const updatedEntities = arrangeEntitiesOverArea(entities, [200, 215])
  const expUpdatedEntities = [
    {
      geometry: {positions: [1, -1, 6, -1, 6, 28], normals: [0, 2, 1]},
      transforms: {pos: [0, 0, 0], rot: [0, 0, 0], sca: [1, 1, 1]},
      bounds: {}
    },
    {
      geometry: {positions: [1, -1, 6, -1, 6, 28], normals: [0, 2, 1]},
      transforms: {pos: [0, 0, 0], rot: [0, 0, 0], sca: [1, 1, 1]},
      bounds: {}
    }
  ]

  t.deepEqual(updatedEntities, expUpdatedEntities)
})
