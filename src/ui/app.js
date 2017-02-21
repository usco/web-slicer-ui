import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h2 } from '@cycle/dom'
// import {merge} from 'most'
import * as most from 'most'
import xs from 'xstream'
const {of, merge, combine} = xs
import {domEvent, fromMost, toMost, makeStateAndReducers$, makeDefaultReducer, mergeReducers, imitateXstream} from '../utils/cycle'
import isolate from '@cycle/isolate'

import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'
import Viewer from './viewer'

import * as R from 'ramda'

import {actions as printSettingsActions} from './printSettings'

import {printerInfos} from '../utils/queries'
import {queryEndpoint} from '../core/umc'

// query printer for infos
// => get printhead & material infos
// => get transformation matrix of active object
// => upload file & start print
// => provide controls to pause/resume abort print

const init = makeDefaultReducer({})
const PrevStep = (state, input) => ({ ...state, currentStep: Math.max(state.currentStep - 1, 0) })
const NextStep = (state, input) => ({ ...state, currentStep: Math.min(state.currentStep + 1, state.steps.length - 1) })
const StartPrint = (state, input) => ({ ...state, printStatus: 'startRequested' })
const SelectPrinter = (state, input) => {
  console.log('SelectPrinter', input)

  state = { ...state, activePrinterId: input }
  console.log('state', state)
  return state
}

const SetPrinters = (state, input) => {
  console.log('SetPrinters', input)
  state = { ...state, printers: input }
  return state
}

const SetActivePrinterInfos = (state, input) => {
  console.log('SetActivePrinterInfos', input)
  const index = R.findIndex(R.propEq('id', state.activePrinterId))(state.printers)
  if (index !== -1) {
    const activePrinter = state.printers[index]
    const printers = R.update(index, {...activePrinter, infos: input}, state.printers)
    state = { ...state, printers }
  }
  return state
}

const actions = {
  init, PrevStep, NextStep, StartPrint,

  SelectPrinter,

  SetPrinters,
  SetActivePrinterInfos
}

// our main view
const view = ([state, printSettings, materialSetup, viewer]) => {
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack
  // console.log('state')
  const {steps, currentStep} = state

  const printers = ul('.printersList', state.printers
    .map(function (printer) {
      const isSelected = state.activePrinterId === printer.id
      return li(classNames({ '.selected': isSelected, '.printerL': true }), {attrs: {'data-id': printer.id}}, printer.name)
    })
  )
  const printerSetup = <section id='printerPicker'>
    <div> Select printer </div>
    {printers}
  </section>

  const stepContents = [
    printerSetup,
    materialSetup,
    printSettings
  ]
  const prevStepUi = currentStep > 0 ? button('.PrevStep', 'Previous step') : ''
  const nextStepUi = currentStep < steps.length - 1 ? button('.NextStep', 'Next step') : ''
  const startPrintUi = currentStep === steps.length - 1 ? button('.StartPrint', 'Start Print') : ''

  // <h1>{t('app_name')}</h1>
  return <section id='wrapper'>
    <section id='viewer'>
      {viewer}
    </section>
    <section id='settings'>
      <h1>{steps[currentStep].name}<span />{prevStepUi}{nextStepUi}{startPrintUi}</h1>
      {stepContents[currentStep]}
    </section>
  </section>
}

function App (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const PrevStepAction$ = _domEvent('.PrevStep', 'click')
  const NextStepAction$ = _domEvent('.NextStep', 'click')
  const StartPrintAction$ = _domEvent('.StartPrint', 'click')

  const SelectPrinterAction$ = _domEvent('.printerL', 'click').map(x => (x.currentTarget.dataset.id))

  // FIXME: switch to drivers
  const SetPrintersAction$ = fromMost(queryEndpoint('/printers').map(x => x.response).tap(x => console.log(x)))// .
    // queryEndpointTest('/printers')
  // fetch data for the selectedprinter
  // const SetActivePrinterInfosAction$ = printerInfos('sdfsdf0').delay(1000)

  const SetActivePrinterInfosAction$ = imitateXstream(SelectPrinterAction$)
    .flatMap(function (id) {
      return queryEndpoint(`/printers/${id}/info`)
        .flatMapError(error => most.of(undefined))// TODO: dispatch errors
        .filter(x => x != undefined)
        .map(x => x.response)
    })

  /* const SetCameraImageAction$ = toMost(SelectPrinterAction$)
    .flatMap(function(id){
      return queryEndpoint(`/printers/${id}/camera`,{'Content-Type': 'image/jpeg'}).map(x => x.response)
    })
    .forEach(function(data){
      console.log('got image')
      console.log(data)
    }) */
    // .forEach(x=>console.log('printerInfos',x))

    // .tap(x=>console.log('printerInfos',x))

  // FIXME: temp workarounds
  const SetQualityPresetAction$ = _domEvent('.SetQualityPreset', 'click').map(x => (x.currentTarget.dataset.index))
  const ToggleBrimAction$ = _domEvent('.ToggleBrim', 'click').map(x => x.target.value)
  const ToggleSupportAction$ = _domEvent('.ToggleSupport', 'click').map(x => x.target.value)

  const actions$ = {
    PrevStepAction$,
    NextStepAction$,
    StartPrintAction$,

    SetPrintersAction$,
    SetActivePrinterInfosAction$: fromMost(SetActivePrinterInfosAction$),
    
    SelectPrinterAction$,

    SetQualityPresetAction$,
    ToggleBrimAction$,
    ToggleSupportAction$
  }

  toMost(StartPrintAction$).forEach(x => console.log('StartPrintAction'))

  const {state$, reducer$} = makeStateAndReducers$(actions$, {...actions, ...printSettingsActions}, sources)

  // sub components
  const printSettings = PrintSettings(sources)
  const materialSetup = MaterialSetup(sources)
  const viewer = isolate(Viewer, 'viewer')(sources)

  const _reducer$ = merge(reducer$, ...[viewer].map(x => x.onion))

  const vdom$ = xs.combine(state$, printSettings.DOM, materialSetup.DOM, viewer.DOM)
    .map((items) => view(items))

  // toMost(state$).forEach(x => console.log('state', x))

  return {
    DOM: vdom$,
    onion: _reducer$
  }
}

export default App
