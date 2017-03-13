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
  // console.log('changeTransforms', transforms)
  /* .scan(function (value, cur) {
    //
    value[cur.idx] = cur.val
    return value
  }, [0, 0, 0]) */
  // let value = [0, 0, 0]
  // value[transforms.idx] = transforms.val
  console.log('transforms', transforms)

  // updateComponents(transformDefaults, state, transforms)

  const selections = []// R.findIndex(R.propEq('id', state.activePrinterId))(state.buildplate)

  console.log('entities', state.buildplate.entities.map(x => x.meta.id))
  /* if (index !== -1) {
    const activePrinter = state.printers[index]
    const printers = R.update(index, {...activePrinter, infos: input}, state.printers)
    state = { ...state, printers }
  } */
  // const propPath = ['print', 'settings', 'support', 'toggled']
  // state = R.assocPath(propPath, !R.path(propPath)(state), state)
  const entities = state.buildplate.entities.map(function (entity) {
    const idMatch = entity => state.buildplate.selections.instIds.indexOf(entity.meta.id) > -1
    if (!idMatch(entity)) return entity
    console.log('update entity', entity.meta.id, transforms[0].value)

    let value = transforms[0].value
    let pos = entity.transforms.pos
    pos[0] = value[0]
    pos[1] = value[1]
    pos[2] = value[2]
    return {...entity, transforms: {...entity.transforms, pos}}
  })
  .map(entity => injectTMatrix(entity, false))

  // console.log('entities after', ''+entities.map(x=>x.transforms.pos))

  return {...state, buildplate: {...state.buildplate, entities}}
}
