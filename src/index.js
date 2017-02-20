// import { run } from '@cycle/most-run'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
// import { of, combine, merge, periodic, combineArray } from 'most'
import xs from 'xstream'
const {of, merge, combine} = xs

import {getTranslations} from './utils/getTranslations'

import {fromMost, mergeReducers, toMost} from './utils/cycle'

import onionify from 'cycle-onionify'
import isolate from '@cycle/isolate'

// import MaterialSetup from './ui/MaterialSetup'
import App from './ui/App'

function main (sources) {
  // initial state
  const init = () => ({
    machineType: 'ultimaker3',
    support: {toggled: true},
    brim: {toggled: true},
    qualityPreset: undefined,
    extruders: [],
    loadedMaterials: [],
    supportExtruder: -1,
    currentStep: 0,
    steps: [{name: 'Material Setup'}, {name: 'Print Settings'}],
    t: x => ''// stand in
  })

  const translations$ = fromMost(getTranslations({en: {translation: require('../assets/i18n/en/strings.json')}}))

  // sub components
  const app = App(sources)

  const setTranslationsReducer$ = translations$.map(t => state => ({...state, t}))
  const state$ = sources.onion.state$

  const reducer$ = merge(
    setTranslationsReducer$,
    mergeReducers(init, [app])
  )

  /*const vdom$ = xs.combine(state$, printSettings.DOM)
     .map(([ state, printSettings ]) => div([
       div(JSON.stringify(state, null, 4)),
       printSettings
     ]))*/
  const vdom$ = xs.combine(state$, app.DOM)
    .map(([ state, app ]) => div([
      div(JSON.stringify(state, null, 4)),
      app
    ]))

  return {
    DOM: vdom$, // state$.map(state=><div>dsffds</div>),
    onion: reducer$
  }
}

const wrappedMain = onionify(main)

const drivers = {
  DOM: makeDOMDriver('#app')
}

run(wrappedMain, drivers)
