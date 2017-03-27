import {merge} from 'most'
import {pluck, propOr, filter, map, reduce, compose, mapAccum, isNil, not, apply, addIndex, path} from 'ramda'

import {domEvent, makeStateAndReducers$, imitateXstream, fromMost} from '../../utils/cycle'
import {toDegree, toRadian} from '../../utils/formatters'
import withLatestFrom from '../../utils/most/withLatestFrom'
import {averageWithDefault} from '../../utils/maths'
import {reduceToAverage, spreadToAll} from '../../utils/various'
import {toArray} from '../../utils/utils'
function isNumber (arg) {
  return typeof arg === 'number'
}

import {renderPositionUi} from './position'
import {renderRotationUi} from './rotation'
import {renderScaleUi} from './scale'
import {renderMirroringUi} from './mirroring'

require('./style.css')

const init = (state) => {
  console.log('init entityInfos state', state)
  return state
}

export const actions = {
  init
}

const view = function (state) {
  return [
    renderPositionUi(state),
    renderScaleUi(state),
    renderRotationUi(state),
    renderMirroringUi(state)
  ]
}

function EntityInfos (sources) {
  const _domEvent = domEvent.bind(null, sources)

  const actions$ = {
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  const viewState$ = imitateXstream(state$)
    .map(state => state.buildplate)
    .map(function (state) {
      const {settings, activeTool, selections, entities} = state

      // match entities by id from the selections list
      const idMatch = entity => selections.instIds.indexOf(entity.meta.id) > -1
      const transforms = pluck('transforms')(filter(idMatch, entities))
      const bounds = pluck('bounds')(filter(idMatch, entities))
      const geomBbox = compose(
        map(path(['geometry', 'bounds'])),
        filter(idMatch)
      )(entities)

      // compute the average scale (%), since we are dealing with 0...n entities
      const scaleAverage = compose(
        averageWithDefault('sca', [1, 1, 1])
      )(transforms)

      // compute the average scale(absolute), since we are dealing with 0...n entities
      const initialSizeAverage = compose(
        averageWithDefault('size', [0, 0, 0])
      )(geomBbox)

      const sizeAverage = compose(
        addIndex(map)((x, index) => x * scaleAverage[index]),
        averageWithDefault('size', [0, 0, 0])
      )(geomBbox)

      // compute the average position, since we are dealing with 0...n entities
      const positionAverage = averageWithDefault('pos', [0, 0, 0])(transforms)
      // compute the average rotation, since we are dealing with 0...n entities
      const rotationAverage = compose(
        map(toDegree),
        averageWithDefault('rot', [0, 0, 0])
      )(transforms)

      return {initialSizeAverage, sizeAverage, scaleAverage, positionAverage, rotationAverage, selections, settings, activeTool}
    })
    .skipRepeats()
    .multicast()

  const _changeBounds$ = merge(
    _domEvent('.absScaling', 'change'),
    _domEvent('.absScaling', 'blur'),
  )
  .map(function (e) {
    const val = parseFloat(e.target.value)
    const attributes = e.target.dataset
    const [trans, idx, extra] = attributes.transform.split('_')
    return {val, idx: parseInt(idx, 10)}
  })
  .skipRepeats()
  .multicast()

  const changeBounds$ = withLatestFrom((changed, {initialSizeAverage, sizeAverage, scaleAverage, selections, settings}) => {
    if (!selections || selections.length === 0) {
      return {value: undefined} // FIXME: fixes a weird bug about selection loss
    }

    const currentScale = scaleAverage
    const initialSize = initialSizeAverage
    const currentSize = initialSize.map((x, index) => x * currentScale[index])
    let afterChangeSize = [...currentSize]
    afterChangeSize[changed.idx] = changed.val

    const diff = [afterChangeSize[0] - currentSize[0], afterChangeSize[1] - currentSize[1], afterChangeSize[2] - currentSize[2]]
    let newScale = currentScale // start with current scale
        .map((component, index) => component + diff[index] / initialSize[index])
    return {value: newScale, trans: 'sca', ids: selections.instIds, settings}
  }, _changeBounds$, [viewState$])
    .filter(x => x.value !== undefined)
    .skipRepeats()
    .multicast()
    .map(x => ({type: 'changeBounds', data: x}))

  // NOTE: do not use input events for this, annoying spammy, does not let you type
  const _changeTransforms$ = merge(
      _domEvent('.transformsInput', 'change'),
      _domEvent('.transformsInput', 'blur'),
      // special one for scaling
      _domEvent('.transformsInputPercent', 'change'),
      _domEvent('.transformsInputPercent', 'blur'),
    )
    .map(function (e) {
      let val = parseFloat(e.target.value)
      const attributes = e.target.dataset
      let dtrans = attributes.transform
      let [trans, idx, extra] = dtrans.split('_')
      if (trans === 'rot') {
        val = toRadian(val)
      } else if (trans === 'sca') {
        val = extra === 'percent' ? val / 100 : undefined
      }
      return {val, trans, extra, idx: parseInt(idx, 10)}
    })
    .filter(x => x.val !== undefined)
    .filter(data => isNumber(data.val))
    .skipRepeats()

  const changeTransforms$ = withLatestFrom((changed, {positionAverage, rotationAverage, scaleAverage, selections, settings}) => {
    if (!selections || selections.length === 0) {
      return {value: undefined} // FIXME: fixes a weird bug about selection loss
    }
    let value = {
      pos: positionAverage,
      rot: rotationAverage,
      sca: scaleAverage
    }[changed.trans]
    value[changed.idx] = changed.val

    return {value, trans: changed.trans, ids: selections.instIds, settings}
  }, _changeTransforms$, [viewState$])
  .merge(changeBounds$.map(x => x.data))
  .filter(x => x.value !== undefined)// if invalid data, ignore
  .map(spreadToAll(['value', 'trans', 'settings']))
  .map(toArray)// we always expect arrays of data
  .map(x => ({type: 'changeTransforms', data: x}))
  .skipRepeats()
  .multicast()

  const resetScaling$ = _domEvent('.resetScaling', 'click')
    .constant(true)
    .map(x => ({type: 'resetScaling', data: x}))
    .skipRepeats()
    .multicast()

    /* const changePosition$ = changeTransforms$
      .filter(c => c.trans === 'pos')

    const changeRotation$ = changeTransforms$
      .filter(c => c.trans === 'rot')
      .map(change => ({...change, val: toRadian(change.val)}))// convert rotated values back from degrees to radians

    const changeScale$ = changeTransforms$
      .filter(c => c.trans === 'sca')
      .map(change => {
        return {...change, val: change.extra === 'percent' ? change.val / 100 : change.val}
      }) */

  const _mirror$ = merge(
    _domEvent('.mirror-x', 'click').constant({axis: 0}),
    _domEvent('.mirror-y', 'click').constant({axis: 1}),
    _domEvent('.mirror-z', 'click').constant({axis: 2})
  )

  const mirror$ = withLatestFrom(({axis}, {scaleAverage, selections, settings}) => {
    let value = scaleAverage
    value[axis] *= -1
    return {...axis, trans: 'sca', value, ids: selections.instIds, settings}
  }, _mirror$, [viewState$])
  .map(spreadToAll(['axis', 'trans', 'value', 'settings']))
  .map(toArray)// we always expect arrays of data
  .map(x => ({type: 'changeTransforms', data: x}))

  return {
    DOM: fromMost(viewState$.skipRepeats().map(view)),
    onion: reducer$,
    events: fromMost(merge(changeTransforms$, changeBounds$, resetScaling$, mirror$))
  }
}

export default EntityInfos
