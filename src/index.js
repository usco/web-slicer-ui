import { run } from '@cycle/most-run'
import { div, span, label, input, hr, h1, makeDOMDriver, button } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
import { of, combine } from 'most'
import {getTranslations} from './utils/getTranslations'

import MaterialSetup from './ui/MaterialSetup'
import PrintSettings from './ui/PrintSettings'

function main (sources) {
  // initial state
  const init = () => ({
    machineType: 'ultimaker3',
    support: {toggled: true},
    brim: {toggled: true},
    qualityPreset: undefined,
    extruders: [],
    loadedMaterials: [],
    currentStep: 0,
    steps: [{name: 'Material Setup'}, {name: 'Print Settings'}]
  })

  const translations$ = getTranslations({en: require('../assets/i18n/en/strings.json')})
  const state$ = combine((state, t) => ({...state, t}), of(init()), translations$)

  const SetQualityPresetAction$ = sources.DOM.select('SetQualityPreset').events('click')
  const ToggleBrimAction$ = sources.DOM.select('ToggleBrim').events('click')
  const ToggleSupportAction$ = sources.DOM.select('ToggleSupport').events('click')


  return {
    DOM: state$.map(PrintSettings)
  }
}

const drivers = {
  DOM: makeDOMDriver('#app')
}

run(main, drivers)
