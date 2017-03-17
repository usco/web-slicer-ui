import classNames from 'classnames'
import {domEvent, makeStateAndReducers$} from '../utils/cycle'
import { div, button, li, ul, h1, h2, span, section, header, form, input } from '@cycle/dom'
import {assocPath, path} from 'ramda'

import {withToolTip} from './widgets/utils'
import icon from './widgets/icon'
import {infoIconSvg} from './widgets/icons'

import checkbox from './widgets/Checkbox'

const init = (state) => {
  console.log('init printSettings state', state)
  state = ({ ...state, print: {...state.print} })
  return state
}

const ToggleBrim = (state, input) => {
  console.log('ToggleBrim')
  const propPath = ['print', 'settings', 'brim', 'toggled']
  state = assocPath(propPath, !path(propPath)(state), state)
  return state
}

const ToggleSupport = (state, input) => {
  console.log('ToggleSupport')
  const propPath = ['print', 'settings', 'support', 'toggled']
  state = assocPath(propPath, !path(propPath)(state), state)
  return state
}

const SetQualityPreset = (state, input) => {
  console.log('SetQualityPreset', input)
  state = assocPath(['print', 'settings', 'qualityPreset'], input, state)
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
    return div([
      input({props: {type: 'radio', name: 'supportMaterials', value: supportMaterial, checked: (supportMaterial === selectedSupportMaterial)}}),
      `Extruder ${index + 1} ${supportMaterial}`
    ])
  })

  const maintext = ''/* t('activity_print_settings_text_info')
    .replace(`<font color='black'>%1$s</font>`, printCores[0])
    .replace(`<font color='black'>%2$s</font>`, printCores[1]) */

  /* <section className='status info'>
    {t('activity_print_settings_text_the_app_only_supports')}
  </section> */

  const profileInfos = withToolTip(span(t('activity_print_settings_text_print_profile')), t('activity_print_settings_layer_height_description'), 'left')
  const supportInfos = withToolTip(span(t('activity_print_settings_text_support_structure')), t('activity_print_settings_text_select_support_structure_description'), 'left')
  const brimInfos = withToolTip(span(t('activity_print_settings_text_adhesion_brim')), t('activity_print_settings_text_brim_description'), 'left')
  return section('.printSettings', [
    header(maintext),

    section('.profile', [
      header([h1([profileInfos])]),
      div('.layerHeights', [
        ul(layerHeightButtons)
      ])
    ]),

    section('.supports', [
      header([
        h1([
          supportInfos,
          checkbox({id: 'ToggleSupport', className: 'ToggleSupport', checked: support.toggled})
        ])
      ]),
      div(classNames({ '.disabled': !support.toggled}), [
        form(supportMaterialsUi)
      ])
    ]),

    section('.brim', [
      header([
        h1([
          brimInfos,
          checkbox({id: 'ToggleBrim', className: 'ToggleBrim', checked: brim.toggled})
        ])
      ]),
      div(classNames({ '.disabled': !brim.toggled}))
    ])
  ])
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
