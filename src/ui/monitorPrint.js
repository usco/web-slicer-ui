import {find, propEq, lensPath, compose, view as rView} from 'ramda'
import {section, div, button, img} from '@cycle/dom'
import renderProgressBar from './widgets/ProgressBar'

import {domEvent, makeStateAndReducers$} from '../utils/cycle'
import {hotends, bed, jobInfos, formatTime} from '../core/printing/utils'

const init = (state) => {
  console.log('init monitorPrint state', state)
  state = ({ ...state, print: {...state.print, status: 'paused'} })
  return state
}

export const actions = {
  init
}

const view = function (state) {
  const activePrinter = find(propEq('id', state.printing.activePrinterId))(state.printing.printers)

  // we consider the printer to be inactive if the state is undefined or idle
  const isInactive = false// (state.printing.printerStatus.state === undefined || state.printing.printerStatus.state === 'idle')

  const hTemps = hotends(activePrinter)
    .map((hotend, index) => `T${index}: ${hotend.temperature.current} / ${hotend.temperature.target} °C`)
  const bedTemp = `Bed: ${bed(activePrinter).temperature.current} / ${bed(activePrinter).temperature.target} °C`

  // only show detailed status if printer is active
  const statusUi = isInactive ? null : div('.temperatures', `Temperature: ${hTemps}, ${bedTemp}`)

  const progressData = jobInfos(state.printing.printerStatus)
  const timeLeft = formatTime(progressData.time_total - progressData.time_elapsed)
  const progressUi = isInactive
    ? null
    : div('.printProgress', [div('', `Time left: ${timeLeft.hours}h ${timeLeft.minutes}min`)])

  return section('.MonitorPrint', [
    div('.printStatus', 'STATUS:' + state.printing.printerStatus.message),
    statusUi,
    progressUi,
    renderProgressBar({progress: progressData.progress * 100, hideOnDone: false}),
    div('', [
      button('.pauseResume', state.print.paused ? 'play' : 'pause'),
      button('.abort', 'abort')
    ]),
    img('.printerCameraFrame', {props: {src: state.printing.frame ? state.printing.frame : ''}})
  ])
}

function MonitorPrint (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const pauseResume$ = _domEvent('.pauseResume', 'click').scan((state, newValue) => !state, false)// FIXME: it is SCAN with most.js
  const abort$ = _domEvent('.abort', 'click')

  const actions$ = {
    // pauseResume$, abort$
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  /* const events = merge(
    pauseResume$.map(action => ({type: 'pauseResumePrint', data: action})),
    abort$.map(action => ({type: 'abortPrint', data: action}))
  ) */

  return {
    DOM: state$.filter(state => state.printing.activePrinterId !== undefined).map(view).startWith(undefined),
    onion: reducer$
    // events
  }
}

export default MonitorPrint
