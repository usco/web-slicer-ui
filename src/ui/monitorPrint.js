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
  return section('.MonitorPrint', [
    div('.printStatus', 'STATUS:' + state.printStatus),
    div('', [
      button('.pauseResume', state.print.paused ? 'play' : 'pause'),
      button('.abort', 'abort')
    ]),
    img('.printerCameraFrame', {props: {src: state.image ? state.image : ''}})
  ])
}
/* section('.MonitorPrint', [
  div('', [
    button('.pauseResume', state.paused ? 'play' : 'pause'),
    button('.abort', 'abort')
  ]),
  img('.printerCameraFrame', {props: {src: state.image ? state.image : ''}})
]) */

function MonitorPrint (sources) {
  const _domEvent = domEvent.bind(null, sources)
  // const pauseResume$ = _domEvent('.pauseResume', 'click').fold((state, newValue) => !state, false)// FIXME: it is SCAN with most.js
  // const abort$ = _domEvent('.abort', 'click')

  const actions$ = {
    // pauseResume$, abort$
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}

export default MonitorPrint
