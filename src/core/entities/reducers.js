import { injectNormals, injectTMatrix, injectBounds } from './prepHelpers'
import {transformDefaults, updateComponents, resetScaling as resetTransformsScaling} from './components/transforms'
import { computeBounds } from '@usco/bounds-utils'
import applyMat4ToAABB from '../../utils/bounds/applyMat4ToAABB'
import applyMat4ToGeometry from '../../utils/geometry/applyMat4ToGeometry'
import mat4 from 'gl-mat4'

export function addEntities (state, inputs) {
  return {...state, buildplate: {...state.buildplate, entities: state.buildplate.entities.concat([inputs])}}
}

export function clearEntities (state, inputs) {
  return {...state, buildplate: {...state.buildplate, entities: []}}
}

export function setActiveTool (state, activeTool) {
  // console.log('setActiveTool', activeTool)
  return {...state, buildplate: {...state.buildplate, activeTool}}
}

export function selectEntities (state, selections) {
  console.log('selectEntities', selections)
  return {...state, buildplate: {...state.buildplate, selections: {...state.buildplate.selections, instIds: selections}}}
}

// transforms etc
export function changeTransforms (state, transforms) {
  console.log('transforms', transforms, state.buildplate.entities)
  const entities = updateComponents(transformDefaults, state.buildplate.entities, transforms)
    .map(entity => injectTMatrix(entity, false))
    .map(entity => {
      let bounds = computeBounds({geometry: entity.geometry})
      bounds = applyMat4ToAABB(entity.transforms.matrix, bounds)


      //const geometry = applyMat4ToGeometry(entity.geometry, mat4.translate([], mat4.create(), [0, 0, bounds.size[2] * 0.5]))
      //bounds = computeBounds({geometry})
      //const geometry = applyMat4ToGeometry(entity.geometry, mat4.translate([], mat4.create(), [0, 0, 2]))
      //return {...entity, geometry}
      return {...entity, bounds}
    })
  return {...state, buildplate: {...state.buildplate, entities}}
}

export function resetScaling (state, _) {
  const entities = resetTransformsScaling(transformDefaults, state.buildplate.entities, state.buildplate.selections.instIds)
    .map(entity => injectTMatrix(entity, false))
  return {...state, buildplate: {...state.buildplate, entities}}
}

// transform settings etc
export function toggleSnapTranslation (state, snapTranslation) {
  console.log('toggleSnapTranslation', snapTranslation)
  return {...state, buildplate: {...state.buildplate, settings: {...state.buildplate.settings, snapTranslation}}}
}

export function toggleSnapRotation (state, snapRotation) {
  console.log('snapRotation', snapRotation)
  return {...state, buildplate: {...state.buildplate, settings: {...state.buildplate.settings, snapRotation}}}
}

export function toggleSnapScaling (state, snapScaling) {
  console.log('snapScaling', snapScaling)
  return {...state, buildplate: {...state.buildplate, settings: {...state.buildplate.settings, snapScaling}}}
}

export function toggleUniformScaling (state, uniformScaling) {
  console.log('uniformScaling', uniformScaling)
  return {...state, buildplate: {...state.buildplate, settings: {...state.buildplate.settings, uniformScaling}}}
}
