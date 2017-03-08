import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h1, h2, span, section} from '@cycle/dom'
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

import * as R from 'ramda'

import {actions as printSettingsActions} from './printSettings'
import {actions as monitorPrintActions} from './monitorPrint'

import * as entityActions from '../core/entities/reducers'
import * as printerActions from '../core/printers/reducers'

import {default as printerIntents} from '../core/printers/intents'
import {default as entityIntents} from '../core/entities/intents'

// query printer for infos
// => get printhead & material infos
// => get transformation matrix of active object
// => upload file & start print
// => provide controls to pause/resume abort print

const init = makeDefaultReducer({})
const PrevStep = (state, input) => ({ ...state, currentStep: Math.max(state.currentStep - 1, 0) })
const NextStep = (state, input) => {
  const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
  if (activePrinter && activePrinter.hasOwnProperty('infos')) {
    return {...state, currentStep: Math.min(state.currentStep + 1, state.steps.length - 1)}
  }
  return state
}

const actions = {
  init, PrevStep, NextStep,

  ...printerActions,
  ...entityActions
}
// our main view
const view = ([state, printSettings, materialSetup, viewer, monitorPrint, entityInfos]) => {
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack
  // console.log('state')
  const {steps, currentStep} = state

  const printers = ul('.printersList', state.printers
    .map(function (printer) {
      const isSelected = state.activePrinterId === printer.id
      const isClaimed = printer.claimed
      const printerText = isSelected ? `${printer.name} ${state.printerStatus}` : printer.name

      const classes = classNames({'.selected': isSelected, '.printerL': true})

      const claimButtons = isClaimed // buttons to claim / unclaim printer
        ? button('.unClaim .claimed', {attrs: {'data-id': printer.id}}, 'unClaim')
        : button('.claim', {attrs: {'data-id': printer.id}}, 'claim')

      return li(classes, {attrs: {'data-id': printer.id}}, [
        printerText, isSelected ? '' : claimButtons
      ])
    })
  )// printerStatus
  const printerSetup = section('', [
    state.printers.length > 0 ? div('Select printer', [printers]) : span('please wait, fetching printers ...')
  ])

  const stepContents = [
    printerSetup,
    materialSetup,
    printSettings,
    monitorPrint
  ]
  const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
  // console.log(activePrinter, state.activePrinter)
  const prevStepUi = currentStep > 0 ? button('.PrevStep', 'Previous step') : ''
  const nextStepUi = (currentStep < steps.length - 1 && activePrinter && activePrinter.infos) ? button('.NextStep', 'Next step') : ''
  const startPrintUi = currentStep === steps.length - 1 ? button('.StartPrint', {attrs: {disabled: state.buildplate.entities.length === 0 }}, 'Start Print') : ''

  // <h1>{t('app_name')}</h1>
  return section('#wrapper', [
    section('#viewer', [viewer]),
    section('#entityInfos', [entityInfos]),
    section('#settings', [
      h1([steps[currentStep].name, prevStepUi, nextStepUi, startPrintUi]),
      stepContents[currentStep]
    ])
  ])
}

function App (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const PrevStep$ = _domEvent('.PrevStep', 'click')
  const NextStep$ = _domEvent('.NextStep', 'click')

  const _printerIntents = printerIntents(sources)
  const _entityIntents = entityIntents(sources)//
  // console.log('_entityIntents', _entityIntents$)

  const actions$ = {
    PrevStep$: fromMost(PrevStep$),
    NextStep$: merge(fromMost(NextStep$), fromMost(_printerIntents.SetActivePrinterInfos$.delay(1000))) // once we have the printerInfos , move to next step
  }

  const printActions$ = Object.keys(_printerIntents)
    .reduce((acc, key) => {
      acc[key] = fromMost(_printerIntents[key])
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
    onion: _reducer$
  }
}

export default App
