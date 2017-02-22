import classNames from 'classnames'
import { html } from 'snabbdom-jsx'
import {domEvent, fromMost, makeStateAndReducers$, makeDefaultReducer, toMost} from '../utils/cycle'
import { div, button, li, ul, h2 } from '@cycle/dom'
import * as R from 'ramda'

const init = (state) => {
  console.log('init printSettings state', state)
  state = ({ ...state, print: {...state.print} })
  return state
}

const ToggleBrim = (state, input) => {
  console.log('ToggleBrim')
  const propPath = ['print', 'settings', 'brim', 'toggled']
  state = R.assocPath(propPath, !R.path(propPath)(state), state)
  return state
}

const ToggleSupport = (state, input) => {
  console.log('ToggleSupport')
  const propPath = ['print', 'settings', 'support', 'toggled']
  state = R.assocPath(propPath, !R.path(propPath)(state), state)
  return state
}

const SetQualityPreset = (state, input) => {
  console.log('SetQualityPreset', input)
  state = R.assocPath(['print', 'settings', 'qualityPreset'], input, state)
  return state
}

const SetLayerHeight = (state, input) => {
  state = { ...state, layerHeight: !state.layerHeight }
  return state
}

const actions = {init, ToggleBrim, ToggleSupport, SetLayerHeight, SetQualityPreset}

const view = (state) => {
  // console.log('state for PrintSettings',state)

  if (!state.hasOwnProperty('t')) return null // FIXME : bloody hack

  const selectedSupportMaterial = 'pva'

  const printCores = ['BB 0.4', 'AA 0.4']

  const {t, print} = state
  const settings = print.settings
  const {support, brim, qualityPreset} = settings

  const layerHeights = [0.2, 0.15, 0.1, 0.06]
  const qualityPresets = ['draft', 'fast', 'normal', 'high']

  const layerHeightNames = {
    '0.2': t('activity_print_settings_text_draft'),
    '0.15': t('activity_print_settings_text_fast'),
    '0.1': t('activity_print_settings_text_normal'),
    '0.06': t('activity_print_settings_text_high')
  }
  const layerHeightUnit = 'mm'

  const layerHeightButtons = layerHeights.map(function (height, index) {
    const qualityPresetName = `${layerHeightNames[height]}`
    const qualityDetails = `${height} ${layerHeightUnit}`
    const isSelected = qualityPreset === qualityPresets[index]
    return li(classNames({ '.selected': isSelected }), [
      button('.SetQualityPreset', {attrs: {'data-index': qualityPresets[index]}}, [
        h2(qualityPresetName),
        div(qualityDetails)
      ])
    ])
  })

  const supportMaterials = ['pva', 'pla']

  const supportMaterialsUi = supportMaterials.map(function (supportMaterial, index) {
    return <div>
      <input
        type='radio'
        name='supportMaterials'
        value={supportMaterial}
        checked={supportMaterial === selectedSupportMaterial}
               >
        {supportMaterial}
      </input>
             Extruder
             {index + 1}:
             {supportMaterial}
    </div>
  })

  const maintext = t('activity_print_settings_text_info')
    .replace(`<font color='black'>%1$s</font>`, printCores[0])
    .replace(`<font color='black'>%2$s</font>`, printCores[1])

  return <section className='printSettings'>
    <header>
      {maintext}
    </header>
    <section className='status info'>
      {t('activity_print_settings_text_the_app_only_supports')}
    </section>
    <section className='profile'>
      <header>
        <h1>{t('activity_print_settings_text_print_profile')}</h1>
        {t('activity_print_settings_layer_height_description')}
      </header>
      <div className='layerHeights'>
        <ul>
          {layerHeightButtons}
        </ul>
      </div>
    </section>
    <section className='supports'>
      <header>
        <h1>
          <span>{t('activity_print_settings_text_support_structure')}</span>
          <input type='checkbox' checked={support.toggled} className='ToggleSupport' />
        </h1>
      </header>
      <div disabled={support.toggled ? false : 'disabled'}>
        {t('activity_print_settings_text_select_support_structure_description')}
        <form>
          {supportMaterialsUi}
        </form>
      </div>
    </section>
    <section className='brim'>
      <header>
        <h1>
          <span>{t('activity_print_settings_text_adhesion_brim')}</span>
          <input type='checkbox' checked={brim.toggled} className='ToggleBrim' />
        </h1>
      </header>
      <div disabled={brim.toggled ? false : 'disabled'}>
        {t('activity_print_settings_text_brim_description')}
      </div>
    </section>
  </section>
}

function PrintSettings (sources) {
  const _domEvent = domEvent.bind(null, sources)
  const SetQualityPreset$ = _domEvent('.SetQualityPreset', 'click').map(x => (x.currentTarget.dataset.index))
  const ToggleBrim$ = _domEvent('.ToggleBrim', 'click').map(x => x.target.value)
  const ToggleSupport$ = _domEvent('.ToggleSupport', 'click').map(x => x.target.value)

  const actions$ = {
    /* SetQualityPreset$,
    ToggleBrim$,
    ToggleSupport$ */
  }

  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}

export {init, actions}
export default PrintSettings
