import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import { div, button, li, ul, h2 } from '@cycle/dom'
import dropRepeats from 'xstream/extra/dropRepeats'
import * as R from 'ramda'

import {domEvent, fromMost, makeStateAndReducers$, makeDefaultReducer} from '../utils/cycle'
import {pickExtruders, pickMaterials, pickHotends} from '../core/printing/utils'
import {materials} from '../core/materials/lookupMaterial'

const init = () => ({})

const actions = {init}

const view = (state) => {
  // console.log('state for MaterialSetup', state)
  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack

  const {t} = state

  // console.log('activePrinter', activePrinterInfos)

  let usefulData = {
    extruders: [],
    materials: [],
    hotends: []
  }

  // FIXME: temporary hack, look into sanctuary lib or other way of dealing with empty data
  if (state.printers && state.activePrinterId) {
    const activePrinterInfos = R.prop('infos', R.find(R.propEq('id', state.activePrinterId), state.printers))

    if (activePrinterInfos && activePrinterInfos.hasOwnProperty('heads')) {
      const extruders = pickExtruders(activePrinterInfos)
      usefulData = {
        extruders,
        materials: pickMaterials(extruders),
        hotends: pickHotends(extruders)
      }
    }
  }
  // TODO check materials combo
  const validMaterialCoresCombo = true

  const statusHeaderText = validMaterialCoresCombo ? t('activity_check_material_configuration_valid') : t('activity_check_material_textview_material_invalid')

  const coresAndMaterials = usefulData.hotends.map(function (hotend, index) {
    const material = R.find(R.propEq('guid', usefulData.materials[index]))(materials)
    const materialString = material ? `${material.color} ${material.type}` : 'n/a'
    return {core: hotend, material: materialString, valid: true}
  })
  // [{core: 'AA 0.4', material: 'PLA', valid: true}, {core: 'BB 0.4', material: 'PVA', valid: false}]
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
    DOM: state$.map(state => ({printers: state.printing.printers, activePrinterId: state.printing.activePrinterId, t: state.t })).compose(dropRepeats()).map(view),
    onion: reducer$
  }
}

export {init, actions}
export default MaterialSetup
