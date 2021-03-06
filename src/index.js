// import { run } from '@cycle/most-run'
import { run } from '@cycle/xstream-run'
import { makeDOMDriver, div } from '@cycle/dom'
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
        qualityPreset: 'normal',
        supportExtruder: -1
      },
      status: 'n/a',
      running: false,
      paused: false
    },

    printing: {
      settings: {
        printersPollRate: 30000, // how often to update the camera
        cameraPollRate: 20000 // how often to update the camera
      },
      printers: [
        /* {id: '080987D', name: 'my printer', infos: {type: 'ultimaker3'}} */
      ],
      // for printers list
      printersStatus: undefined,
      // for individual printers
      printerStatus: {message: 'fetching printer data , please wait...', state: undefined, busy: false},
      activePrinterId: undefined,
      connectedPrinters: [],
      frame: undefined
    },

    buildplate: {
      settings: {
        snapTranslation: false,
        snapRotation: false,
        snapScaling: false,
        uniformScaling: false
      },
      entities: [],
      activeTool: -1,
      selections: {
        instIds: []
      }
    },

    // ui related
    steps: [{name: 'Printer Setup'}, {name: 'Material Setup'}, {name: 'Monitor Print'}, {name: 'Print Settings'}],
    currentStep: 0,
    printerListToggled: false,
    selectedPrintTools : 'settings',

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
    // log: app.log,
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
