/*import { run } from '@cycle/most-run'
import { makeDOMDriver, div } from '@cycle/dom'
import { just } from 'most'

function main (sources) {
  console.log(sources)
  return {
    DOM: just(div('foo'))
  }
}
const drivers = {
  DOM: makeDomDriver(document.getElementById('app'))
}
run(main, drivers)*/
import { h, render } from 'preact-cycle'
/** @jsx h */

import App from './ui/app'
import {getTranslations} from './utils/getTranslations'

const materials = require('../assets/materials.json')

let state = {
  machineType: 'ultimaker3',
  support: {toggled: true},
  brim: {toggled: true},
  qualityPreset: undefined,
  extruders: [],
  loadedMaterials: [],
  currentStep: 0,
  steps: [{name: 'Material Setup'}, {name: 'Print Settings'}]
}

getTranslations({en: require('../assets/i18n/en/strings.json')})
  .forEach(t => {
    state.t = t
    render(App, state, document.body)
  })
