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
import addressBarDriver from './sideEffects/addressBarDriver'
import appMetadataDriver from './sideEffects/appMetadataDriver'
import eventsDriver from './sideEffects/eventsDriver'

import App from './ui/app'

function main (sources) {
  // initial state
  const init = () => ({
    print: {
      settings: {
        support: {toggled: true},
        brim: {toggled: true},
        qualityPreset: undefined,
        supportExtruder: -1
      },
      status: 'n/a',
      running: false,
      paused: false
    },
    printers: [
      /* {id: '080987D', name: 'my printer', infos: {type: 'ultimaker3'}} */
    ],
    printersStatus: undefined, // for printers list
    printerStatus: {message: 'fetching printer data , please wait...', state: undefined}, // for individual printers
    activePrinterId: undefined,

    buildplate: {
      entities: [],
      settings: {
        snapTranslation: false,
        snapRotation: false,
        snapScaling: false,
        uniformScaling: false
      },
      activeTool: -1,
      selections: {
        instIds: []
      }
    },

    settings: {
      printersPollRate: 10000, // how often to update the camera
      cameraPollRate: 10000 // how often to update the camera
    },

    // ui related
    steps: [{name: 'Printer Setup'}, {name: 'Material Setup'}, {name: 'Monitor Print'}, {name: 'Print Settings'}],
    currentStep: 0,
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
    events: app.events,
    //log: app.log,
    onion: reducer$
  }
}

const wrappedMain = onionify(main)

const drivers = {
  DOM: makeDOMDriver('#app'),
  window: windowApiDriver,
  addressBar: addressBarDriver,
  metaData: appMetadataDriver,
  events: eventsDriver,
  log: msg$ => { msg$.addListener({next: msg => console.log(msg)}) }
}

run(wrappedMain, drivers)
