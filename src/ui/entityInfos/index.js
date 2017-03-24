import {merge} from 'most'
import {pluck, propOr, filter, map, reduce, compose, mapAccum, isNil, not, apply, addIndex, path} from 'ramda'

import {domEvent, makeStateAndReducers$, imitateXstream, fromMost} from '../../utils/cycle'
import {toDegree} from '../../utils/formatters'
import withLatestFrom from '../../utils/most/withLatestFrom'
import {averageWithDefault} from '../../utils/maths'

import {renderPositionUi} from './position'
import {renderRotationUi} from './rotation'
import {renderScaleUi} from './scale'

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
    renderRotationUi(state),
    renderScaleUi(state)
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
      const scalePercentAverage = compose(
        map(x => x * 100),
        averageWithDefault('sca', [1, 1, 1])
      )(transforms)

      // compute the average scale(absolute), since we are dealing with 0...n entities
      const initialSizeAverage = compose(
        // addIndex(map)((x, index) => x * scalePercentAverage[index] / 100),
        averageWithDefault('size', [0, 0, 0])
      )(geomBbox)

      const sizeAverage = compose(
        addIndex(map)((x, index) => x * scalePercentAverage[index] / 100),
        averageWithDefault('size', [0, 0, 0])
      )(geomBbox)

      // compute the average position, since we are dealing with 0...n entities
      const positionAverage = averageWithDefault('pos', [0, 0, 0])(transforms)

      // compute the average rotation, since we are dealing with 0...n entities
      const rotationAverage = compose(
        map(toDegree),
        averageWithDefault('rot', [0, 0, 0])
      )(transforms)
      // console.log('updating viewState', sizeAverage, scalePercentAverage, rotationAverage)

      return {initialSizeAverage, sizeAverage, scalePercentAverage, positionAverage, rotationAverage, selections, settings, activeTool}
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

  const changeBounds$ = withLatestFrom((changed, {initialSizeAverage, sizeAverage, scalePercentAverage, selections, settings}) => {
    // console.log('combining', changed, sizeAverage)
    if (!selections || selections.length === 0) {
      return {value: undefined} // FIXME: fixes a weird bug about selection loss
    }
    /*
    const currentAverage = sizeAverage
    let newAverage = [...sizeAverage]
    newAverage[changed.idx] = changed.val
    // return {oldValue: sizeAverage, value: newValue, ids: selections}
    //let newScale = [newAverage[0] / currentAverage[0], newAverage[1] / currentAverage[1], newAverage[2] / currentAverage[2]]
    //console.log('here', 'sizeAverage', currentAverage, 'newAverage', newAverage, 'newScale', newScale, 'currentScale',currentScale)

    const diff = [newAverage[0] - currentAverage[0], newAverage[1] - currentAverage[1], newAverage[2] - currentAverage[2]] */
    const currentScale = scalePercentAverage.map(x => x / 100)
    const initialSize = initialSizeAverage
    const currentSize = initialSize.map((x, index) => x * currentScale[index])
    let afterChangeSize = [...currentSize]
    afterChangeSize[changed.idx] = changed.val

    const diff = [afterChangeSize[0] - currentSize[0], afterChangeSize[1] - currentSize[1], afterChangeSize[2] - currentSize[2]]
    let newScale = currentScale // start with current scale
      .map((component, index) => component + diff[index] / initialSize[index])
    /* newScale = newScale.map(function (component, index) {
      return currentScale[index] !== 1 && index !==changed.idx? currentScale[index] : component
    }) */
    return {value: newScale, trans: 'sca', ids: selections.instIds, settings}
  }, _changeBounds$, [viewState$])
  .filter(x => x.value !== undefined)
  // .tap(e => console.log('eeee', e))
  .skipRepeats()
  .multicast()
  .map(x => ({type: 'changeBounds', data: x}))

  return {
    DOM: fromMost(viewState$.skipRepeats().map(view)),
    onion: reducer$,
    events: fromMost(changeBounds$)
  }
}

export default EntityInfos
