import {mergeActionsByName} from '../../utils/most/various'
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


  const refinedActions = {addEntities$}

  return {...baseActions, ...refinedActions}
}
