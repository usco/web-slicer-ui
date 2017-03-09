import {mergeActionsByName} from '../../utils/most/various'
import {toArray} from '../../utils/utils'
import actionsFromDOM from './actions/fromDom'

import {dataSources} from '../../io/dataSources'

import {sample} from 'most'
import {pluck} from 'ramda'
import {reduceToAverage, spreadToAll} from '../../utils/various'
import {imitateXstream} from '../../utils/cycle'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources)
  ]
  const baseActions = mergeActionsByName(actionsSources)

  // FIXME this should go elsewhere
  const addEntities$ = dataSources(sources)
    .tap(x => console.log('adding entities', x))

  // every time a new entity gets added, select it
  const selectEntities$ = addEntities$
    .map(x => x.meta.id)
    .map(toArray)

  // if we set the same tool twice, disable it (ie, toggle mode)
  const setActiveTool$ = baseActions.setActiveTool$
    .scan((current, newValue) => {
      return current === newValue ? undefined : newValue
    })


  function withLatestFrom(fn, otherStreams, stream$){
    console.log(stream$, fn, otherStreams)
    return sample(fn, stream$, ...otherStreams)
  }

  const state$ = imitateXstream(sources.onion.state$).skipRepeats()
  const entitiesAndSelections$ = state$.map(state => ({selections: state.buildplate.selections.instIds, entities: state.buildplate.entities, settings: state.buildplate.settings}))
  const changeTransforms$ = sample(function (changed, {entities, selections, settings}) {
    let avg = pluck(changed.trans)(pluck('transforms')(entities))
      .reduce(reduceToAverage, undefined)
    avg[changed.idx] = changed.val

    return {value: avg, trans: changed.trans, ids: selections, settings}
  }, baseActions.changeTransforms$, baseActions.changeTransforms$, entitiesAndSelections$)
    // .merge(scaleFromBounds$)
    .filter(x => x.value !== undefined)// if invalid data, ignore
    .map(spreadToAll(['value', 'trans', 'settings']))
    .map(toArray)// we always expect arrays of data
    .skipRepeats()
    //.tap(e => console.log('changeTransforms', e))


  const refinedActions = {addEntities$, selectEntities$, setActiveTool$, changeTransforms$}

  return {...baseActions, ...refinedActions}
}
