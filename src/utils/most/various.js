import {merge} from 'most'

export function mergeActionsByName (actionSources, validActions = []) {
  return actionSources.reduce(function (result, actions) {
    // console.log("acions",Object.keys(actions),validActions)
    Object.keys(actions)
      .filter(key => validActions.length === 0 || validActions.indexOf(key.replace('$', '')) > -1)
      .map(function (key) {
        const action = actions[key]
        if (key in result) {
          result[key] = merge(result[key], action)
        } else {
          result[key] = action
        }
      })

    return result
  }, {})
}

const retry = (n, stream) => stream.recoverWith(e => n === 0 ? most.throwError(e) : retry(n - 1, stream))
// .thru(retry.bind(null,1))
