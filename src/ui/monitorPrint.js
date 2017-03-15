import {find, propEq, lensPath, compose, view as rView} from 'ramda'
import {section, div, button, img} from '@cycle/dom'
import renderProgressBar from './widgets/ProgressBar'

import {domEvent, makeStateAndReducers$} from '../utils/cycle'
import {hotends, bed, jobInfos, formatTime} from '../core/printers/utils'

const init = (state) => {
  console.log('init monitorPrint state', state)
  state = ({ ...state, image: undefined, print: {...state.print, status: 'paused'} })
  return state
}

export const actions = {
  init
}

const view = function (state) {
  const activePrinter = find(propEq('id', state.activePrinterId))(state.printers)

  // we consider the printer to be inactive if the state is undefined or idle
  const isInactive = false// (state.printerStatus.state === undefined || state.printerStatus.state === 'idle')

  const hTemps = hotends(activePrinter)
    .map((hotend, index) => `T${index}: ${hotend.temperature.current} / ${hotend.temperature.target} °C`)
  const bedTemp = `Bed: ${bed(activePrinter).temperature.current} / ${bed(activePrinter).temperature.target} °C`

  // only show detailed status if printer is active
  const statusUi = isInactive ? null : div('.temperatures', `Temperature: ${hTemps}, ${bedTemp}`)

  const progressData = jobInfos(state.printStatus)
  const progressUi = isInactive
    ? null
    : div('.printProgress', [div('', `Time left:${formatTime(progressData.time_total - progressData.time_elapsed).hours}hrs`)])

  console.log(progressData)

  return section('.MonitorPrint', [
    div('.printStatus', 'STATUS:' + state.printerStatus.message),
    statusUi,
    progressUi,
    renderProgressBar({progress: progressData.progress * 100}),
    div('', [
      button('.pauseResume', state.print.paused ? 'play' : 'pause'),
      button('.abort', 'abort')
    ]),
    img('.printerCameraFrame', {props: {src: state.image ? state.image : ''}})
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
    DOM: state$.filter(state => state.activePrinterId !== undefined).map(view).startWith(undefined),
    onion: reducer$
    // events
  }
}

export default MonitorPrint
