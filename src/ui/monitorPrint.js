import {section, div, button} from '@cycle/dom'
import classNames from 'classnames'
import {domEvent, makeStateAndReducers$} from '../utils/cycle'

const init = () => ({ img: undefined, print: {status: 'paused'} })
const startpause = (state, input) => ({...state, status: state.status === 'paused' ? 'running' : 'paused'})
const abort = (state, input) => ({state})

const actions = {
  init,
  startpause,
  abort
}

const view = state => section([
  div('', [
    button('.startpause', state.paused ? 'play' : 'pause'),
    button('.abort', 'abort')
  ]),
  img({props: {src: state.img}})
])

function MonitorPrint (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const startpause$ = _domEvent('.startpause', 'click')
  const abort$ = _domEvent('.abort', 'click')

  const actions$ = {
    startpause$, abort$
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}

export default MonitorPrint
