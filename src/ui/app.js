import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h2 } from '@cycle/dom'
// import {merge} from 'most'
import xs from 'xstream'
const {of, merge, combine} = xs
import {domEvent, fromMost, toMost, makeStateAndReducers$, makeDefaultReducer, mergeReducers} from '../utils/cycle'
import isolate from '@cycle/isolate'

import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'
import Viewer from './viewer'

import {actions as printSettingsActions} from './printSettings'

import {queryEndpoint} from '../core/umc'

// query printer for infos
// => get printhead & material infos
// => get transformation matrix of active object
// => upload file & start print
// => provide controls to pause/resume abort print

const init = makeDefaultReducer({})
const PrevStep = (state, input) => ({ ...state, currentStep: Math.min(state.currentStep - 1, 0) })
const NextStep = (state, input) => ({ ...state, currentStep: Math.max(state.currentStep + 1, state.steps.length - 1) })
const StartPrint = (state, input) => ({ ...state, printStatus: 'startRequested' })


const SetPrinters = (state, input) => {
  console.log('SetPrinters', input)

  state = { ...state, printers: input }
  return state
}

const actions = {
  init, PrevStep, NextStep, StartPrint,
  SetPrinters
}


//our main view
const view = ([state, printSettings, materialSetup, viewer]) => {
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack
  //console.log('state')
  const {steps, currentStep} = state
  const stepContents = [
    materialSetup,
    printSettings
  ]
  const prevStepUi = currentStep > 0 ? button('.PrevStep', 'Previous step') : ''
  const nextStepUi = currentStep < steps.length - 1 ? button('.NextStep', 'Next step') : ''
  const startPrintUi = currentStep === steps.length - 1 ? button('.StartPrint', 'Start Print') : ''

  const printers = ul('.printersList',state.printers.map(printer => li('',printer.name)))

  // <h1>{t('app_name')}</h1>
  return <div id='app'>
    <section id='wrapper'>
      <section id='printerPicker'>
        <div> Select printer </div>
      </section>
      <section id='viewer'>
        {viewer}
      </section>
      <section id='settings'>
        <h1>{steps[currentStep].name}{prevStepUi}{nextStepUi}{startPrintUi}</h1>
        {stepContents[currentStep]}
      </section>
    </section>
    <section id='printers'>
      {printers}
    </section>
  </div>
}

function App (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const PrevStepAction$ = _domEvent('.PrevStep', 'click')
  const NextStepAction$ = _domEvent('.NextStep', 'click')
  const StartPrintAction$ = _domEvent('.StartPrint', 'click')

  //FIXME: switch to drivers
  const SetPrintersAction$ = fromMost(queryEndpoint('/printers').map(x=>x.response))//.forEach(x=>console.log(x))
    queryEndpoint('/printers')//.map(x=>x.response)
      .forEach(x=>console.log(x))
  // FIXME: temp workarounds
  const SetQualityPresetAction$ = _domEvent('.SetQualityPreset', 'click').map(x => (x.currentTarget.dataset.index))
  const ToggleBrimAction$ = _domEvent('.ToggleBrim', 'click').map(x => x.target.value)
  const ToggleSupportAction$ = _domEvent('.ToggleSupport', 'click').map(x => x.target.value)

  const actions$ = {
    PrevStepAction$,
    NextStepAction$,
    StartPrintAction$,

    //SetPrintersAction$,

    SetQualityPresetAction$,
    ToggleBrimAction$,
    ToggleSupportAction$
  }

  toMost(StartPrintAction$).forEach(x=>console.log('StartPrintAction'))

  const {state$, reducer$} = makeStateAndReducers$(actions$, {...actions, ...printSettingsActions}, sources)

  // sub components
  const printSettings = PrintSettings(sources)
  const materialSetup = MaterialSetup(sources)
  const viewer = isolate(Viewer, 'viewer')(sources)

  const _reducer$ = merge(reducer$, ...[viewer].map(x=>x.onion))

  const vdom$ = xs.combine(state$, printSettings.DOM, materialSetup.DOM, viewer.DOM)
    .map((items) => view(items))

  return {
    DOM: vdom$,
    onion: _reducer$
  }
}

export default App
