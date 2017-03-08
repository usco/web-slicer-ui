import {mergeActionsByName} from '../../utils/most/various'
import {toArray} from '../../utils/utils'
import actionsFromDOM from './actions/fromDom'

import {dataSources} from '../../io/dataSources'

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
    .tap(x => console.log('fooo entities', x))

  // if we set the same tool twice, disable it (ie, toggle mode)
  const setActiveTool$ = baseActions.setActiveTool$
    .scan((current, newValue) => {
      return current === newValue ? undefined : newValue
    })

  const refinedActions = {addEntities$, selectEntities$, setActiveTool$}

  return {...baseActions, ...refinedActions}
}
