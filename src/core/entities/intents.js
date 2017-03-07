import {mergeActionsByName} from '../../utils/most/various'
import actionsFromDOM from './actions/fromDom'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources)
  ]
  const baseActions = mergeActionsByName(actionsSources)

  const refinedActions = {}

  return {...baseActions, ...refinedActions}
}
