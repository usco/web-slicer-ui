import { injectNormals, injectTMatrix, injectBounds } from './prepHelpers'
import {updateComponents, transformDefaults} from './components/transforms'

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

export function selectEntities (state, selections) {
  console.log('selectEntities', selections)
  return {...state, buildplate: {...state.buildplate, selections: {...state.buildplate.selections, instIds: selections}}}
}

export function changeTransforms (state, transforms) {
  console.log('transforms', transforms, state.buildplate.entities)
  const entities = updateComponents(transformDefaults, state.buildplate.entities, transforms)
    .map(entity => injectTMatrix(entity, false))
  return {...state, buildplate: {...state.buildplate, entities}}
}
