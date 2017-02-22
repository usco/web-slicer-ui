// import { run } from '@cycle/most-run'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
// import { of, combine, merge, periodic, combineArray } from 'most'
import xs from 'xstream'
const {merge} = xs

import {getTranslations} from './utils/getTranslations'
import {fromMost, mergeReducers} from './utils/cycle'
import onionify from 'cycle-onionify'

import windowApiDriver from './sideEffects/windowApiDriver'

import App from './ui/App'

function main (sources) {
  // initial state
  const init = () => ({
    print: {
      settings: {
        support: {toggled: true},
        brim: {toggled: true},
        qualityPreset: undefined
      },
      status: 'n/a',
      running: false,
      paused: false,
    },
    support: {toggled: true},
    brim: {toggled: true},
    qualityPreset: undefined,
    extruders: [],
    loadedMaterials: [],
    supportExtruder: -1,

    currentStep: 0,
    steps: [{name: 'Printer Setup'}, {name: 'Material Setup'}, {name: 'Monitor Print'}, {name: 'Print Settings'}],

    activePrinterId: undefined,
    printers: [
      /* {id: 'dsqdq', name: 'fba', infos: {type: 'ultimaker3'}} */
    ],
    image: undefined,
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

  // const vdom$ = app.DOM.map(app => app)

  return {
    DOM: app.DOM,
    onion: reducer$
  }
}

const wrappedMain = onionify(main)

const drivers = {
  DOM: makeDOMDriver('#app'),
  window: windowApiDriver
}

run(wrappedMain, drivers)
