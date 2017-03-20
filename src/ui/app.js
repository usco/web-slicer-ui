import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h1, h2, p, span, section} from '@cycle/dom'
// import {merge} from 'most'
import xs from 'xstream'
const {merge} = xs
import {domEvent, fromMost, makeStateAndReducers$, makeDefaultReducer} from '../utils/cycle'
import isolate from '@cycle/isolate'

import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'
import MonitorPrint from './monitorPrint'
import EntityInfos from './entityInfos'

import Viewer from './viewer'

import {find, propEq} from 'ramda'

import {actions as printSettingsActions} from './printSettings'
import {actions as monitorPrintActions} from './monitorPrint'

import * as entityActions from '../core/entities/reducers'
import * as printingActions from '../core/printing/reducers'

import {default as printingIntents} from '../core/printing/intents'
import {default as entityIntents} from '../core/entities/intents'

import printers from './printers'

import {withToolTip} from './widgets/utils'

// query printer for infos
// => get printhead & material infos
// => get transformation matrix of active object
// => upload file & start print
// => provide controls to pause/resume abort print

const init = makeDefaultReducer({})
const PrevStep = (state, input) => ({ ...state, currentStep: Math.max(state.currentStep - 1, 0) })
const NextStep = (state, input) => {
  const activePrinter = R.find(R.propEq('id', state.printing.activePrinterId))(state.printing.printers)
  if (activePrinter && activePrinter.hasOwnProperty('infos')) {
    return {...state, currentStep: Math.min(state.currentStep + 1, state.steps.length - 1)}
  }
  return state
}

const togglePrintersList = (state, input) => {
  return {...state, printerListToggled: input}
}

const actions = {
  init, PrevStep, NextStep, togglePrintersList,

  ...printingActions,
  ...entityActions
}
// our main view
const view = ([state, printSettings, materialSetup, viewer, monitorPrint, entityInfos]) => {
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack
  // console.log('state')
  const {steps, currentStep} = state

  const stepContents = [
    // printerSetup,
    materialSetup,
    printSettings,
    monitorPrint
  ]
  const activePrinter = find(propEq('id', state.printing.activePrinterId))(state.printing.printers)
  const newPrintEnabled = state.buildplate.entities.length > 0 && state.printing.printerStatus.busy !== true && state.printing.activePrinterId !== undefined

  console.log('newPrintEnabled', newPrintEnabled, state.buildplate.entities.length, state.printing.printerStatus.busy)

  const prevStepUi = currentStep > 0 ? button('.PrevStep', 'Previous step') : ''
  const nextStepUi = (currentStep < steps.length - 1 && activePrinter && activePrinter.infos) ? button('.NextStep', 'Next step') : ''

  const startPrintTooltip = newPrintEnabled ? '' : 'please select a printer, add a file & be sure the printer is not already busy'
  const startPrintUi = withToolTip(
    button('.startPrint .temp', {attrs: {disabled: !newPrintEnabled }}, 'Start Print'),
   startPrintTooltip, 'top'
 )

  // <h1>{t('app_name')}</h1>
  return section('#wrapper', [
    section('#viewer', [viewer]),
    section('#entityInfos', entityInfos),
    section('#settings.settings', [
      printers(state),
      //button('.startPrint .temp', 'print'),
      startPrintUi,
      printSettings,
      monitorPrint
      // h1([steps[currentStep].name, prevStepUi, nextStepUi, startPrintUi]),
      // stepContents[currentStep]
    ])

    /* div('.testArea',[
      //withToolTip(button('foooyeah'), 'foooyeah', 'bottom'),
      //withToolTip(icon(infoIconSvg), 'some stuff here'),
      //withToolTip(button('foooyeah'), 'foooyeah', 'bottom'),
      tooltipTopButton,
      tooltipBottomButton,
      tooltipLeftButton,
      tooltipRightButton
      // addToolTip(button('.tooltip-bottom', {attrs: {'data-tooltip': 'some bla bla'}}, 'infos!'))
    ]) */

  ])
}

function App (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const PrevStep$ = _domEvent('.PrevStep', 'click')
  const NextStep$ = _domEvent('.NextStep', 'click')
  const togglePrintersList$ = _domEvent('.printerMenuToggle', 'click').scan((acc, cur) => !acc, false)

  const _printingIntents = printingIntents(sources)
  const _entityIntents = entityIntents(sources)//
  // console.log('_entityIntents', _entityIntents$)

  const actions$ = {
    PrevStep$: fromMost(PrevStep$),
    NextStep$: merge(fromMost(NextStep$)), //, fromMost(_printingIntents.SetActivePrinterInfos$.delay(1000))) // once we have the printerInfos , move to next step
    togglePrintersList$: fromMost(togglePrintersList$)
  }

  const printActions$ = Object.keys(_printingIntents)
    .reduce((acc, key) => {
      acc[key] = fromMost(_printingIntents[key])
      return acc
    }, {})
  const entityActions$ = Object.keys(_entityIntents)
    .reduce((acc, key) => {
      acc[key] = fromMost(_entityIntents[key])
      return acc
    }, {})
  const allActions$ = {...actions$, ...printActions$, ...entityActions$}

  const {state$, reducer$} = makeStateAndReducers$(allActions$, {...actions, ...printSettingsActions, ...monitorPrintActions}, sources)

  // sub components
  const printSettings = PrintSettings(sources)
  const materialSetup = MaterialSetup(sources)
  const viewer = Viewer(sources)
  const monitorPrint = MonitorPrint(sources)
  const entityInfos = EntityInfos(sources)

  const _reducer$ = merge(reducer$, ...[viewer].map(x => x.onion))

  const vdom$ = xs.combine(state$, printSettings.DOM, materialSetup.DOM, viewer.DOM, monitorPrint.DOM, entityInfos.DOM)
    .map((items) => view(items))

  return {
    DOM: vdom$,
    onion: _reducer$,
    events: viewer.events
  }
}

export default App
