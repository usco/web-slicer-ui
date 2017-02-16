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
import i18next from 'i18next'
import { h, render } from 'preact-cycle'
/** @jsx h */

import App from './ui/app'

const stringsEn = require('../assets/i18n/en/strings.json')
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


i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: stringsEn
    }
  }
}, (err, t) => {
  state.t = t
  render(App, state, document.body)
})
