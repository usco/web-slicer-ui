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
import PrintSettings from './printSettings'

const strings_en = require('../assets/i18n/en/strings.json')


let state = {}

const App = ({t}) => (
  <div id='app'>
    {t('app_name')}
    <PrintSettings t={t}> </PrintSettings>
  </div>
)

i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: strings_en
    }
  }
}, (err, t) => {
  // initialized and ready to go!
  //const hw = t('app_name')
  //console.log('hw', hw)

  console.log('foo')
  render(App, {t}, document.body)

})
