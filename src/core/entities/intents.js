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

  const selectEntities$ = addEntities$
    .map(x => x.meta.id)
    .map(toArray)
    .tap(x => console.log('fooo entities', x))


  const refinedActions = {addEntities$, selectEntities$}

  return {...baseActions, ...refinedActions}
}
