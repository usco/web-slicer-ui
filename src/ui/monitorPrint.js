import {section, div, button, img} from '@cycle/dom'
import {domEvent, makeStateAndReducers$} from '../utils/cycle'

const init = (state) => {
  console.log('init monitorPrint state', state)
  state = ({ ...state, image: undefined, print: {...state.print, status: 'paused'} })
  return state
}

export const actions = {
  init
}

const view = function (state) {
  console.log('foo', state.print)
  return section('.MonitorPrint', [
    div('', [
      button('.startpause', state.print.paused ? 'play' : 'pause'),
      button('.abort', 'abort')
    ]),
    img('.printerCameraFrame', {props: {src: state.image ? state.image : ''}})
  ])
}
/* section('.MonitorPrint', [
  div('', [
    button('.startpause', state.paused ? 'play' : 'pause'),
    button('.abort', 'abort')
  ]),
  img('.printerCameraFrame', {props: {src: state.image ? state.image : ''}})
]) */

function MonitorPrint (sources) {
  const _domEvent = domEvent.bind(null, sources)
  //const startpause$ = _domEvent('.startpause', 'click').fold((state, newValue) => !state, false)// FIXME: it is SCAN with most.js
  //const abort$ = _domEvent('.abort', 'click')

  const actions$ = {
    // startpause$, abort$
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}

export default MonitorPrint
