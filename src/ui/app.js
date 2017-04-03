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
import {merge as mostMerge} from 'most'

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

const togglePrintersList = (state, input) => {
  return {...state, printerListToggled: input}
}

const selectPrintTools = (state, selectedPrintTools) => {
  return {...state, selectedPrintTools}
}

const actions = {
  init, togglePrintersList, selectPrintTools,

  ...printingActions,
  ...entityActions
}
// our main view
const view = ([state, printSettings, materialSetup, viewer, monitorPrint, entityInfos]) => {
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack

  const newPrintEnabled = state.buildplate.entities.length > 0 && (state.printing.printerStatus !== undefined && state.printing.printerStatus.busy === false) && state.printing.activePrinterId !== undefined
  const startPrintTooltip = newPrintEnabled ? '' : 'please select a printer, add a file & be sure the printer is not already busy'

  const startPrintUi = withToolTip(
    button('.startPrint .temp', {attrs: {disabled: !newPrintEnabled}}, 'Start Print'),
   startPrintTooltip, 'top'
 )

  const settingsSelected = state.selectedPrintTools === 'settings'
  const monitorSelected = state.selectedPrintTools === 'monitor'

  return section('#wrapper', [
    section('#viewer', [viewer]),
    section('#entityInfos', entityInfos),
    section('#settings.settings', [
      printers(state),
      startPrintUi,
      settingsSelected ? printSettings : undefined,
      monitorSelected ? monitorPrint : undefined,

      button('.toPrintSettings' + (settingsSelected ? '.selected' : ''), 'settings'),
      button('.toMonitorPrint' + (monitorSelected ? '.selected' : ''), 'monitor')
    ])
  ])
}

function App (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const togglePrintersList$ = mostMerge(
    _domEvent('.printerMenuToggle', 'click').constant(true),
    // all the things that disable the printerslist
    _domEvent('.MonitorPrint', 'click').constant(false),
    _domEvent('.printSettings', 'click').constant(false),
    _domEvent('.printerL', 'click').constant(false),
    _domEvent('#viewer', 'click').constant(false)
  )
  .scan((acc, cur) => cur === true ? !acc : false, false)

  const selectPrintTools$ = mostMerge(
    _domEvent('.toPrintSettings', 'click').constant('settings'),
    _domEvent('.toMonitorPrint', 'click').constant('monitor'),
  )

  function isValidElementEvent (event) {
    let element = event.target || event.srcElement
    return !(element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA' || element.isContentEditable)
  }

  _domEvent('document', 'keydown')
    .filter(x => x.code === 'Backspace')
    .filter(isValidElementEvent)
    .map(x => ({type: 'deleteEntity', data: x}))
    .forEach(x => console.log('keydown', x))

  const _printingIntents = printingIntents(sources)
  const _entityIntents = entityIntents(sources)//
  // console.log('_entityIntents', _entityIntents$)

  const actions$ = {
    togglePrintersList$: fromMost(togglePrintersList$),
    selectPrintTools$: fromMost(selectPrintTools$)
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
    events: merge(viewer.events, entityInfos.events)
  }
}

export default App
