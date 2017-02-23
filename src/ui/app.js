import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h1, h2, span, section} from '@cycle/dom'
// import {merge} from 'most'
import * as most from 'most'
import xs from 'xstream'
const {of, merge} = xs
import {domEvent, fromMost, toMost, makeStateAndReducers$, makeDefaultReducer, mergeReducers, imitateXstream} from '../utils/cycle'
import isolate from '@cycle/isolate'

import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'
import MonitorPrint from './monitorPrint'
import Viewer from './viewer'

import * as R from 'ramda'

import {actions as printSettingsActions} from './printSettings'
import {actions as monitorPrintActions} from './monitorPrint'

import {formatImageData} from '../utils/image'

// import {printerInfos} from '../utils/queries'
import {printers, claimedPrinters, claimPrinter, unclaimPrinter, printerInfos, printerCamera} from '../core/umc'

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

const UnClaimPrinter = (state, input) => {
  console.log('UnClaimPrinter', input)
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

const SetCameraImage = (state, input) => {
  state = { ...state, image: input }
  return state
}

const actions = {
  init, PrevStep, NextStep, StartPrint,

  ClaimPrinter,
  UnClaimPrinter,
  SetPrinters,
  SetActivePrinterInfos,

  SelectPrinter,
  SetCameraImage
}

// our main view
const view = ([state, printSettings, materialSetup, viewer, monitorPrint]) => {
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
  const startPrintUi = currentStep === steps.length - 1 ? button('.StartPrint', 'Start Print') : ''

  // <h1>{t('app_name')}</h1>
  return section('#wrapper', [
    section('#viewer', [viewer]),
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
  const StartPrint$ = _domEvent('.StartPrint', 'click')

  // FIXME: switch to drivers

  const SetPrinters$ = most.merge(
    imitateXstream(_domEvent('.RefreshPrintersList', 'click')),
    most.of(null)
  )
  /*.combine((_, state) => ({state}), imitateXstream(sources.onion.state$))
  .flatMap(function ({state}) { // refresh printers list every 30 seconds
    return most.constant(null, most.periodic(state.settings.printersPollRate))
  })*/
  .flatMap(function (_) {
    const allPrinters$ = printers().map(x => x.response)
      .map(printers => printers.map(printer => ({...printer, claimed: undefined})))
    const claimedPrinters$ = claimedPrinters().map(x => x.response)
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
  const SelectPrinter$ = _domEvent('.printerL', 'click').map(x => (x.currentTarget.dataset.id))

  const SetActivePrinterInfos$ = imitateXstream(SelectPrinter$)
    .flatMap(printerInfos)
    .filter(x => x !== undefined)
    .map(x => x.response)
    .multicast()

  const ClaimPrinter$ = imitateXstream(_domEvent('.claim', 'click')).map(x => (x.currentTarget.dataset.id))
    .flatMap(claimPrinter)
    .map(!R.has('error'))

  const UnClaimPrinter$ = imitateXstream(_domEvent('.unClaim', 'click')).map(x => (x.currentTarget.dataset.id))
    .flatMap(unclaimPrinter)
    .map(R.has('error'))

  const SetCameraImage$ = imitateXstream(SelectPrinter$)
    .combine((id, state) => ({state, id}), imitateXstream(sources.onion.state$))
    .flatMap(function ({id, state}) {
      return most.constant(id, most.periodic(state.settings.cameraPollRate))
        .until(imitateXstream(SelectPrinter$))// get images for the current printer id until we select another
    })
    .flatMap(function (id) {
      return printerCamera(id)
    })
    .map(formatImageData.bind(null, 'uint8', 'base64'))

    most.merge(
      imitateXstream(_domEvent('.RefreshPrintersList', 'click')),
      most.of(null)
    )
    .combine((_, state) => ({state}), imitateXstream(sources.onion.state$).map(state => state. settings).skipRepeats())
    .flatMap(function ({state}) { // refresh printers list every 30 seconds
      console.log('state changed', state)
      return most.constant(null, most.periodic(state.printersPollRate))
    }).forEach(x=>console.log('combined state stuff',x ))

  // not sure how to deal with this one
  /* const modelUri$ = most.merge(
    sources.adressBar,
    sources.window.modelUri$
  )
    .flatMapError(function (error) {
      // console.log('error', error)
      modelLoaded(false) // error)
      return just(null)
    })
    .filter(x => x !== null)
    .multicast() */

  // console.log(sources.addressBar)
  // sources.addressBar.url$.forEach(url=>console.log('url',url))

  // FIXME: temp workarounds
  // this is from printSettings
  const SetQualityPreset$ = _domEvent('.SetQualityPreset', 'click').map(x => (x.currentTarget.dataset.index))
  const ToggleBrim$ = _domEvent('.ToggleBrim', 'click').map(x => x.target.value)
  const ToggleSupport$ = _domEvent('.ToggleSupport', 'click').map(x => x.target.value)
  // this is from MonitorPrint
  const startpause$ = _domEvent('.startpause', 'click').fold((state, newValue) => !state, false)// FIXME: it is SCAN with most.js
  const abort$ = _domEvent('.abort', 'click')

  const actions$ = {
    PrevStep$,
    NextStep$: merge(NextStep$, fromMost(SetActivePrinterInfos$.delay(1000))), // once we have the printerInfos , move to next step
    StartPrint$,

    ClaimPrinter$: fromMost(ClaimPrinter$),
    UnClaimPrinter$: fromMost(UnClaimPrinter$),
    SetPrinters$: fromMost(SetPrinters$),
    SetActivePrinterInfos$: fromMost(SetActivePrinterInfos$),
    SetCameraImage$: fromMost(SetCameraImage$),

    SelectPrinter$,

    // print setting actions
    SetQualityPreset$,
    ToggleBrim$,
    ToggleSupport$,

    // monitorPrint actions
    startpause$,
    abort$
  }

  const {state$, reducer$} = makeStateAndReducers$(actions$, {...actions, ...printSettingsActions, ...monitorPrintActions}, sources)

  // sub components
  const printSettings = PrintSettings(sources)
  const materialSetup = MaterialSetup(sources)
  const viewer = isolate(Viewer, 'viewer')(sources)
  const monitorPrint = MonitorPrint(sources)

  const _reducer$ = merge(reducer$, ...[viewer].map(x => x.onion))

  const vdom$ = xs.combine(state$, printSettings.DOM, materialSetup.DOM, viewer.DOM, monitorPrint.DOM)
    .map((items) => view(items))

  return {
    DOM: vdom$,
    onion: _reducer$
  }
}

export default App
