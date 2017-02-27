const reindexGeometry = require('mesh-reindex')
const combineGeometry = require('mesh-combine')
import applyMat4ToGeometry from './applyMat4ToGeometry'

export function combineGeometries (entities) {
  let geometry = entities.map(function (entity) {
    const {geometry, transforms} = entity
    const transformedGeometry = applyMat4ToGeometry(geometry, transforms.matrix)
    const cellsAndPositions = reindexGeometry(transformedGeometry.positions)
    return {...transformedGeometry, ...cellsAndPositions}
  })

  geometry = combineGeometry(geometry)
  return geometry
}
