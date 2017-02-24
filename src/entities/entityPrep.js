// helpers
import { centerGeometry } from '@usco/geometry-utils'
import { offsetTransformsByBounds } from '@usco/transform-utils'
import { injectNormals, injectTMatrix, injectBounds } from './prepHelpers'
import { drawStaticMesh2 as drawStaticMesh } from '@usco/render-utils'

/* Pipeline:
  - data => process (normals computation, color format conversion) => (drawCall generation) => drawCall
  - every object with a fundamentall different 'look' (beyond what can be done with shader parameters) => different (VS) & PS
  - even if regl can 'combine' various uniforms, attributes, props etc, the rule above still applies
*/

export default function entityPrep (rawModelData$) {
  const entitiesWithGeometry$ = rawModelData$
    .filter(entity => entity.hasOwnProperty('geometry'))
    .map(injectNormals)
    .map(injectBounds)
    .map(function (data) {
      const geometry = centerGeometry(data.geometry, data.bounds, data.transforms)
      return Object.assign({}, data, {geometry})
    })
    .map(function (data) {
      let transforms = Object.assign({}, data.transforms, offsetTransformsByBounds(data.transforms, data.bounds))
      const entity = Object.assign({}, data, {transforms})
      return entity
    })

  const entitiesWithoutGeometry$ = rawModelData$
    .filter(entity => !entity.hasOwnProperty('geometry'))

  const addedEntities$ = entitiesWithoutGeometry$
    .merge(entitiesWithGeometry$)
    .map(injectTMatrix)
    .map(function (data) {
      const {visuals, geometry} = data
      // this simplifies things , removing the need to access regl instance here, by inverting the params order of the drawXXX commands, and providing regl only later
      const drawFn = (regl) => drawStaticMesh(regl, {geometry})
      const entity = {...data, visuals: {...visuals, drawFn, initialized: false}}
      return entity
    })
    // .tap(entity => console.log('entity done processing', entity))
    .multicast()

  return addedEntities$

  // NOTE : rotation needs to be manually inverted , or an additional geometry transformation applied
  // const addedEntities$ = rawModelData$
  /* .map(geometry => ({
    transforms: {pos: [0, 0, 60.5], rot: [0, 0, Math.PI], sca: [1, 1, 1], parent: undefined}, // [0.2, 1.125, 1.125]},
    geometry,
    visuals: {
      type: 'mesh',
      visible: true,
      color: [0.02, 0.7, 1, 1] // 07a9ff [1, 1, 0, 0.5],
    },
    meta: {id: 0}})
  ) */
  // .map(injectNormals)
  // .map(injectBounds)

  /* .map(function (data) {
    const geometry = centerGeometry(data.geometry, data.bounds, data.transforms)
    return Object.assign({}, data, {geometry})
  })
  .map(function (data) {
    let transforms = Object.assign({}, data.transforms, offsetTransformsByBounds(data.transforms, data.bounds))
    const entity = Object.assign({}, data, {transforms})
    return entity
  }) */

  // .map(injectBounds) // we need to recompute bounds based on changes above
  // .map(injectTMatrix)
  // .multicast()

  return addedEntities$
}