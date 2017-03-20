import {find, propEq, lensPath, compose, view as rView, nth} from 'ramda'
import {section, div, button, img, table, tr, td, h1, span, li, ul} from '@cycle/dom'
import renderProgressBar from './widgets/ProgressBar'

import {domEvent, makeStateAndReducers$} from '../utils/cycle'
import {hotends, bed, jobInfos, formatTime, timeRemaining, progress} from '../core/printing/utils'
import {formatNumberTo} from '../utils/formatters'

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
  const isAvailable = activePrinter && activePrinter.infos

  const hTemps = hotends(activePrinter)
    .map((hotend, index) => `T${index}: ${hotend.temperature.current} / ${hotend.temperature.target} °C`)
  const bedTemp = isAvailable ? `Bed: ${bed(activePrinter).temperature.current} / ${bed(activePrinter).temperature.target} °C` : undefined

  const progressData = jobInfos(state.printing.printerStatus)
  const timeLeft = timeRemaining(state.printing.printerStatus)// formatTime(progressData.time_total - progressData.time_elapsed)
  const percent = progress(state.printing.printerStatus) // progress percent in 0-1 range, to 2 decimals

  // only show detailed status if printer is active
  const temperaturesUi = isInactive ? undefined : ul('.temperatures', [li(nth(0, hTemps)), li(nth(1, hTemps)), li(bedTemp)])
  const progressTimeUi = progressData === undefined ? undefined : div('.timeLeft', `Time left: ${timeLeft.hours}h ${timeLeft.minutes}min`)
  const progressBarColor = percent < 1 ? undefined : '#88d128'

  const pauseResumeToggle = button('.pauseResume', state.print.paused ? 'play' : 'pause')

  const controlLine = isAvailable ? ul('.controls', [ li([pauseResumeToggle]), li([button('.abort', 'abort')])]) : undefined

  console.log(activePrinter, controlLine)

  return section('.MonitorPrint', [
    renderProgressBar({progress: percent, hideOnDone: false, color: progressBarColor}),
    div('.progressPercent', `${percent * 100}%`),
    h1('.printStatus', state.printing.printerStatus.message),
    progressTimeUi,
    temperaturesUi,
    controlLine,
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
