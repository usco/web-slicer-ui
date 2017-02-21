import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h2, span, section} from '@cycle/dom'
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

const ClaimPrinter = (state, input) => {
  console.log('ClaimPrinter', input)
  const index = R.findIndex(R.propEq('id', state.activePrinterId))(state.printers)

  if (index !== -1) {
    const activePrinter = state.printers[index]
    const printers = R.update(index, {...activePrinter, claimed: input}, state.printers)
    state = { ...state, printers }
  }
  return state
}

const SelectPrinter = (state, input) => {
  console.log('SelectPrinter', input)
  // FIXME: activePrinter is a computed property how do we deal with it ?
  // const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
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

  ClaimPrinter,
  SetPrinters,
  SetActivePrinterInfos,

  SelectPrinter

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
      const classes = classNames({'.selected': isSelected, '.printerL': true})
      return li(classes, {attrs: {'data-id': printer.id}}, [printer.name, isClaimed ? span('.claimed', 'claimed') : button('.claim', {attrs: {'data-id': printer.id}}, 'claim')])
    })
  )
  const printerSetup = section('', [
    state.printers.length > 0 ? div('Select printer', [printers]) : span('please wait, fetching printers ...')
  ])

  const stepContents = [
    printerSetup,
    materialSetup,
    printSettings
  ]
  const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
  // console.log(activePrinter, state.activePrinter)
  const prevStepUi = currentStep > 0 ? button('.PrevStep', 'Previous step') : ''
  const nextStepUi = (currentStep < steps.length - 1 && activePrinter && activePrinter.infos) ? button('.NextStep', 'Next step') : ''
  const startPrintUi = currentStep === steps.length - 1 ? button('.StartPrint', 'Start Print') : ''

  // <h1>{t('app_name')}</h1>
  return <section id='wrapper'>
    <section id='viewer'>
      {viewer}
    </section>
    <section id='settings'>
      <h1>{steps[currentStep].name} {prevStepUi}{nextStepUi}{startPrintUi}</h1>
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

  const SetPrintersAction$ = most.merge(
    imitateXstream(_domEvent('.RefreshPrintersList', 'click')),
    most.of(null)
  ).flatMap(function (_) {
    const allPrinters$ = queryEndpoint('/printers').map(x => x.response)
      .map(printers => printers.map(printer => ({...printer, claimed: undefined})))
    const claimedPrinters$ = queryEndpoint('/printers/claimed').map(x => x.response)
      .map(printers => printers.map(printer => ({...printer, claimed: true})))

    return most.combineArray(function (claimedPrinters, allPrinters) {
      let printers = claimedPrinters
      function addItem (item) {
        const found = R.find(x => x.id === item.id && x.name === item.name)(printers)// R.propEq('id', item.id)
        if (found) {
          if (found.claimed === undefined) {
            found.claimed = false
          }
        } else {
          item.claimed = false
          printers.push(item)
        }
      }
      allPrinters.forEach(addItem)
      return printers
    }, [claimedPrinters$, allPrinters$])
  })

  // fetch data for the selectedprinter
  const SelectPrinterAction$ = _domEvent('.printerL', 'click').map(x => (x.currentTarget.dataset.id))

  function claimPrinter (id) {
    return queryEndpoint(`/printers/${id}/claim`, {method: 'POST'})
      .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
  }

  const SetActivePrinterInfosAction$ = imitateXstream(SelectPrinterAction$)
    .flatMap(function (id) {
      const infos$ = queryEndpoint(`/printers/${id}/info`)// .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
        .flatMapError(error => {
          /* if (error.error === 'client not authorized') {
          } */
          return most.of(undefined)
        })
      return infos$
      // const variant$ = queryEndpoint(`/printers/${id}/system/variant`)
    })
    .filter(x => x !== undefined)
    .map(x => x.response)

  const ClaimPrinterAction$ = imitateXstream(_domEvent('.claim', 'click')).map(x => (x.currentTarget.dataset.id))
    .flatMap(claimPrinter)
    .map(x => R.has('error'))

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

    ClaimPrinterAction$: fromMost(ClaimPrinterAction$),
    SetPrintersAction$: fromMost(SetPrintersAction$),
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

  return {
    DOM: vdom$,
    onion: _reducer$
  }
}

export default App
