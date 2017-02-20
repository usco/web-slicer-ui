import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import {domEvent, fromMost, makeStateAndReducers$, makeDefaultReducer} from '../utils/cycle'
import { div, button, li, ul, h2 } from '@cycle/dom'

const init = () => ({})

const actions = {init}

const view = (state) => {
  //console.log('state for MaterialSetup', state)
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack

  const {t} = state
  // TODO check materials combo
  const validMaterialCoresCombo = true

  const statusHeaderText = validMaterialCoresCombo ? t('activity_check_material_configuration_valid') : t('activity_check_material_textview_material_invalid')

  const coresAndMaterials = [{core: 'AA 0.4', material: 'PLA', valid: true}, {core: 'BB 0.4', material: 'PVA', valid: false}]
  const coresAndMaterialsUi = coresAndMaterials.map(function (data, index) {
    return <li>
      <span>{`Valid:${data.valid}`}</span>
      <span>{`  Extruder ${index + 1}: ${data.material} - ${data.core}`}</span>
    </li>
  })

  return <section className='materialSetup'>
    <header className={classNames({ status: true, 'valid': validMaterialCoresCombo, 'invalid': !validMaterialCoresCombo })}>
      {statusHeaderText}
    </header>
    <div>
      {t('activity_check_material_printer_is_currently_loaded_with')}
    </div>
    <div className='coresAndMaterial'>
      <ul>
        {coresAndMaterialsUi}
      </ul>
    </div>
    <footer>
      {t('activity_check_material_supported_materials')}
    </footer>
  </section>
}

function MaterialSetup (sources) {
  const _domEvent = domEvent.bind(null, sources)

  const {state$, reducer$} = makeStateAndReducers$({}, actions, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}

export {init, actions}
export default MaterialSetup
