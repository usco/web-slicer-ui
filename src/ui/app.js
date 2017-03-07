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

import {dataSources} from '../io/dataSources'

import * as entityActions from '../core/entities/reducers'
import * as printerActions from '../core/printers/reducers'

import {default as printerIntents} from '../core/printers/intents'

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
      const classes = classNames({'.selected': isSelected, '.printerL': true})
      return li(classes, {attrs: {'data-id': printer.id}}, [
        printer.name, isClaimed
          ? button('.unClaim .claimed', {attrs: {'data-id': printer.id}}, 'unClaim')
          : button('.claim', {attrs: {'data-id': printer.id}}, 'claim')
      ])
    })
  )
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
  const startPrintUi = currentStep === steps.length - 1 ? button('.StartPrint', {attrs: {disabled: state.entities.length === 0 }}, 'Start Print') : ''

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
  // console.log(sources.addressBar)
  // sources.addressBar.url$.forEach(url=>console.log('url',url))

  const printerIntents$ = printerIntents(sources)

  // FIXME this should go elsewhere
  const addEntities$ = dataSources(sources)
    .tap(x => console.log('adding entities', x))

  // FIXME: temp workarounds
  // this is from printSettings
  const SetQualityPreset$ = _domEvent('.SetQualityPreset', 'click').map(x => (x.currentTarget.dataset.index))
  const ToggleBrim$ = _domEvent('.ToggleBrim', 'click').map(x => x.target.value)
  const ToggleSupport$ = _domEvent('.ToggleSupport', 'click').map(x => x.target.value)
  // this is from MonitorPrint
  const startpause$ = _domEvent('.startpause', 'click').fold((state, newValue) => !state, false)// FIXME: it is SCAN with most.js

  const actions$ = {
    PrevStep$,
    NextStep$: merge(NextStep$, fromMost(printerIntents$.SetActivePrinterInfos$.delay(1000))), // once we have the printerInfos , move to next step
    StartPrint$: fromMost(printerIntents$.StartPrint$),

    ClaimPrinter$: fromMost(printerIntents$.ClaimPrinter$),
    UnClaimPrinter$: fromMost(printerIntents$.UnClaimPrinter$),
    SetPrinters$: fromMost(printerIntents$.SetPrinters$),
    SetActivePrinterInfos$: fromMost(printerIntents$.SetActivePrinterInfos$),
    SetActivePrinterSystem$: fromMost(printerIntents$.SetActivePrinterSystem$),
    SetCameraImage$: fromMost(printerIntents$.SetCameraImage$),

    SelectPrinter$: fromMost(printerIntents$.SelectPrinter$),

    // print setting actions
    SetQualityPreset$,
    ToggleBrim$,
    ToggleSupport$,

    // monitorPrint actions
    startpause$,
    abort$: fromMost(printerIntents$.AbortPrint$),

    // buildplate, 3d models
    addEntities$: fromMost(addEntities$)
  }

  const {state$, reducer$} = makeStateAndReducers$(actions$, {...actions, ...printSettingsActions, ...monitorPrintActions}, sources)

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
