import { pluck, head, assocPath, filter, find, findIndex, propEq, update } from 'ramda'

// import { createComponents, removeComponents, duplicateComponents, makeActionsFromApiFns } from './common'
// import { makeModel, mergeData } from '../../../utils/modelUtils'
// //Transforms//////

const mergeData = Object.assign

/* applies snapping for both rotation and scaling
maps the rotationtransformValues from to degrees and back */
function applySnapping (transformValues, stepSize, mapValue = undefined) {
  const numberToRoundTo = 1 / stepSize
  for (let i = 0; i < transformValues.length; i++) {
    let roundedNumber = transformValues[i]
    roundedNumber = mapValue ? roundedNumber * (180 / Math.PI) : roundedNumber
    roundedNumber = Math.round(roundedNumber * numberToRoundTo) / numberToRoundTo
    if (mapValue) { roundedNumber = roundedNumber * (Math.PI / 180) }
    transformValues[i] = roundedNumber
  }
  return transformValues
}

/*
  sorts the values and sees which is different, because this is the changes
  then applies the new value to all dimension in respect to the minus sign because this is added by mirroring
*/
function applyUniformScaling (transformDefaults, transformValues) {
  let sortedValues = JSON.parse(JSON.stringify(transformValues)) // deepcopy
  if (sortedValues.length === 0 || sortedValues[0] === null || sortedValues[0] === undefined || sortedValues[0].isNaN) {
    transformValues = sortedValues = transformDefaults.sca // safety catch
  }
  sortedValues = sortedValues.map(Math.abs).slice().sort()
  for (let i = 0; i < sortedValues.length; i++) {
    if (sortedValues[i] === sortedValues[i + 1]) {
      sortedValues.splice(i, 2)
    }
  }
  const newValue = sortedValues[0]
  transformValues = transformValues.map(function (value) {
    return value < 0 ? -(newValue) : newValue
  })
  return transformValues
}

function applySnapAndUniformScaling (transformDefaults, transformationType, transformation, settings) {
  const snapDefaults = {
    pos: 0.1, // snap translation snaps to 0.1 units
    rot: 10, // snap rotation snaps to tens of degrees
    sca: 0.1 // snap scaling snaps to tens of percentages
  }
  // console.log('applySnapAndUniformScaling', transformation)
  let {uniformScaling, snapScaling, snapRotation, snapTranslation} = settings

  if (uniformScaling && transformationType === 'sca') { transformation = applyUniformScaling(transformDefaults, transformation) }
  if (snapScaling && transformationType === 'sca') { transformation = applySnapping(transformation, snapDefaults[transformationType]) }
  if (snapTranslation && transformationType === 'pos') { transformation = applySnapping(transformation, snapDefaults[transformationType]) }
  if (snapRotation && transformationType === 'rot') { transformation = applySnapping(transformation, snapDefaults[transformationType], (2 * Math.PI)) }
  return transformation
}

// mirror on given axis
export function mirrorComponents (transformDefaults, state, inputs) {
  return inputs.reduce(function (state, input) {
    let updatedScale = Object.assign([], transformDefaults.sca, state[input.id].sca)
    updatedScale[input.axis] *= -1 // mirroring is just inverting scale on the given axis

    return assocPath([input.id, 'sca'], updatedScale, state) // return updated state
  }, state)
}

// reset scaling to default
export function resetScaling (transformDefaults, state, inputs) {
  return inputs.reduce(function (state, input) {
    const updatedScale = [...transformDefaults.sca]
    const index = findIndex(entity => entity.meta.id === input)(state)
    const updatedEntity = state[index]
    return update(index, {...updatedEntity, transforms: {...updatedEntity.transforms, sca: updatedScale}}, state) // return updated state
  }, state)
}

// update any transform component (pos, rot, scale) does NOT mutate the original state
export function updateComponents (transformDefaults, state, inputs) {
  const idMatch = entity => find(propEq('id', entity.meta.id))(inputs)
  const changedEntities = filter(idMatch, state)
  const transforms = pluck('transforms')(changedEntities) // current transforms from state

  const transform = head(inputs)['trans'] // what transform do we want to update?
  const currentAvg = pluck(transform)(transforms) // we compute the current average of all inputs (multi selection)
    .reduce(function (acc, cur) {
      if (!acc) return cur
      return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
    }, undefined)

  return inputs.reduce(function (state, input) {
    let {id, value, trans, settings} = input

    // compute the diff between new average and old average
    const diff = [value[0] - currentAvg[0], value[1] - currentAvg[1], value[2] - currentAvg[2]]

    // what transform component do we target ?
    const targetComponent = find(entity => entity.meta.id === id)(changedEntities).transforms
    // generate actual transformation
    const transformation = diff.map(function (value, index) {
      return targetComponent[trans][index] + value
    }) || transformDefaults

    // apply any limits, snapping etc
    const updatedTransformation = applySnapAndUniformScaling(transformDefaults, trans, transformation, settings)
    // return updated state
    const indexInState = findIndex(entity => entity.meta.id === id)(state)
    const updatedTranforms = assocPath([trans], updatedTransformation, targetComponent)
    return update(indexInState, {...state[indexInState], transforms: updatedTranforms}, state)
    // return assocPath([id, trans], updatedTransformation, state)
  }, state)
}

export const transformDefaults = {
  pos: [ 0, 0, 0 ],
  rot: [ 0, 0, 0 ],
  sca: [ 1, 1, 1 ]
}

/*
export function makeTransformsSystem (actions) {
  const defaults = {}

  const updateFns = {
    resetScaling: resetScaling.bind(null, transformDefaults),
    mirrorComponents: mirrorComponents.bind(null, transformDefaults),
    updateComponents: updateComponents.bind(null, transformDefaults),
    createComponents: createComponents.bind(null, transformDefaults),
    duplicateComponents,
  removeComponents}

  actions = actions || makeActionsFromApiFns(updateFns)

  let transforms$ = makeModel(defaults, updateFns, actions)

  return {
    transforms$,
    transformActions: actions
  }
} */
