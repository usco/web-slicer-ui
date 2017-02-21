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
const NextStep = (state, input) => {
  const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
  if (activePrinter && activePrinter.hasOwnProperty('infos')) {
    return {...state, currentStep: Math.min(state.currentStep + 1, state.steps.length - 1)}
  }
  return state
}
const StartPrint = (state, input) => ({ ...state, printStatus: 'startRequested' })
const SelectPrinter = (state, input) => {
  console.log('SelectPrinter', input)
  //FIXME: activePrinter is a computed property how do we deal with it ?
  const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
  state = { ...state, activePrinterId: input, activePrinter }
  console.log('state', state)
  return state
}

const SetPrinters = (state, input) => {
  console.log('SetPrinters', input)
  state = { ...state, printers: input }
  return state
}

const GetActivePrinterInfos = (state, input) => {
  console.log('GetActivePrinterInfos', input)
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
  GetActivePrinterInfos
}

// our main view
const view = ([state, printSettings, materialSetup, viewer]) => {
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack
  // console.log('state')
  const {steps, currentStep} = state

  const printers = ul('.printersList', state.printers
    .map(function (printer) {
      const isSelected = state.activePrinterId === printer.id
      const isClaimed = printer.claimed
      return li(classNames({ '.selected': isSelected, '.printerL': true, '.claimed':isClaimed }), {attrs: {'data-id': printer.id}}, printer.name)
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
  const nextStepUi = currentStep < steps.length - 1 && state.activePrinterId  ? button('.NextStep', 'Next step') : ''
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

  // FIXME: switch to drivers
  const allPrinters$ = queryEndpoint('/printers').map(x => x.response)
    .map(printers => printers.map(printer => ({...printer, claimed: undefined})))
  const claimedPrinters$ = queryEndpoint('/printers/claimed').map(x => x.response)
    .map(printers => printers.map(printer => ({...printer, claimed: true})))

  const SetPrintersAction$ = most.combineArray(function (claimedPrinters, allPrinters) {
    let printers = claimedPrinters
    function addItem (item) {
      const found = R.find(x => x.id === item.id && x.name === item.name)(printers)// R.propEq('id', item.id)
      if (found) {
        if (found.claimed === undefined) {
          found.claimed = false
          //printers.push(item)
        }
      } else {
        item.claimed = false
        printers.push(item)
      }
    }
    allPrinters.forEach(addItem)

    console.log(claimedPrinters, allPrinters)
    return printers
  }, [claimedPrinters$, allPrinters$])

    // queryEndpointTest('/printers')
  // fetch data for the selectedprinter
  // const GetActivePrinterInfosAction$ = printerInfos('sdfsdf0').delay(1000)
  const SelectPrinterAction$ = _domEvent('.printerL', 'click').map(x => (x.currentTarget.dataset.id))

  const GetActivePrinterInfosAction$ = imitateXstream(SelectPrinterAction$)
    .flatMap(function (id) {
      return queryEndpoint(`/printers/${id}/info`)
        // .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
        .flatMapError(error => {
          if (error.error === 'client not authorized') {
            console.log('printer not claimed')
            return queryEndpoint(`/printers/${id}/claim`, {method: 'POST'})
              .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
          }
          return most.of(undefined)
        })
    })
    .filter(x => x !== undefined)
    .map(x => x.response)

    /* .map(function(data){
      if('error' in data){
        if(data.error.error === 'client not authorized'){
          console.log('printer not claimed')
          return queryEndpoint(`/printers/${id}/claim`, {method: 'POST'})
            .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
        }
        console.log('error', data)
      }
      return data
      //.filter(x => x != undefined)
      //.map(x => x.response)
    })
    .map(function(foo){
      console.log('here', foo)
      return foo
    }) */

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

    SetPrintersAction$: fromMost(SetPrintersAction$),
    GetActivePrinterInfosAction$: fromMost(GetActivePrinterInfosAction$),

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
