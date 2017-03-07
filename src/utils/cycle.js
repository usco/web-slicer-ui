// import { of, merge } from 'most'
import xs from 'xstream'
const {of, merge} = xs
import convert from 'stream-conversions'
const {create} = require('@most/create')

export function domEvent (sources, selector, event) {
  return imitateXstream(sources.DOM.select(selector).events(event))
}

export function makeStateAndReducers$ (actions$, actionFns, sources) {
  const {init} = actionFns
  const init$ = of(init)

  const elements = Object.keys(actions$).map(function (actionName$) {
    const name = actionName$.replace('$', '')
    const actFn = actionFns[name]
    const act$ = actions$[actionName$]
      .map(action => state => actFn(state, action))
    return act$
  })

  const reducer$ = merge(init$, ...elements)
  const state$ = sources.onion.state$
  return {state$, reducer$}
}

export function mergeReducers (init, components) {
  return merge(of(init), ...components.map(x => x.onion)) // FIXME :toMost is only temporary
}

export function makeDefaultReducer (defaultstate = {}) {
  return function defaultReducer (prevState) {
    if (typeof prevState === 'undefined') {
      return defaultstate // Parent didn't provide state for the child, so initialize it.
    } else {
      return prevState // Let's just use the state given from the parent.
    }
  }
}

const toMost = convert.xstream.to.most
const fromMost = convert.most.to.xstream
export { toMost, fromMost }

export function imitateXstream (xstream) {
  return create((add, end, error) => {
    xstream.addListener({
      next: i => add(i),
      error: err => error(err),
      complete: () => end()
    })
  })
}
