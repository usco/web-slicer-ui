import {mergeActionsByName} from '../../utils/most/various'
import {toArray} from '../../utils/utils'
import actionsFromDOM from './actions/fromDom'
import actionsFromEvents from './actions/fromEvents'

import {dataSources} from '../../io/dataSources'

import {sample, merge} from 'most'
import {pluck, filter} from 'ramda'
import {reduceToAverage, spreadToAll} from '../../utils/various'
import {imitateXstream} from '../../utils/cycle'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources),
    actionsFromEvents(sources)
  ]
  const baseActions = mergeActionsByName(actionsSources)

  // FIXME this should go elsewhere
  const addEntities$ = dataSources(sources)
    .tap(x => console.log('adding entities', x))

  // every time a new entity gets added, select it
  const selectEntities$ = merge(
    addEntities$.map(x => x.meta.id),
    baseActions.selectEntities$
  )
    .map(toArray)

  // if we set the same tool twice, disable it (ie, toggle mode)
  const setActiveTool$ = baseActions.setActiveTool$
    .scan((current, newValue) => {
      return current === newValue ? undefined : newValue
    })

  const state$ = imitateXstream(sources.onion.state$).skipRepeats()
  const entitiesAndSelections$ = state$.map(state => ({selections: state.buildplate.selections.instIds, entities: state.buildplate.entities, settings: state.buildplate.settings}))

  // specific to needing z === 0 for printing
  const bounceBackTransforms$ = baseActions.changeTransforms$
    .map(function (x) {
      // return x.map(data => ({...data, value: data.trans === 'pos' ? [data.value[0], data.value[1], 0] : data.value}))
      if (x.length > 0) {
        if (x[0].trans === 'pos' && x[0].value[2] !== 0) {
          x[0].value[2] = 0
          return x
        }
      }
      return undefined
    })
    .filter(x => x !== undefined)
    .delay(500)

  const refinedActions = {addEntities$, selectEntities$, setActiveTool$, changeTransforms$: merge(baseActions.changeTransforms$, bounceBackTransforms$)}

  return {...baseActions, ...refinedActions}
}
