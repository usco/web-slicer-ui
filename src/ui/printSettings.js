import classNames from 'classnames'
import { html } from 'snabbdom-jsx'

const ToggleBrim = (state, input) => {
  console.log('ToggleBrim')
  const brim = {...state.brim, toggled: !state.brim.toggled}
  state = { ...state, brim }
  return state
}

const ToggleSupport = (state, input) => {
  console.log('ToggleSupport')
  const support = {...state.support, toggled: !state.support.toggled}
  state = { ...state, support }
  return state
}

const SetQualityPreset = (state, input) => {
  console.log('SetQualityPreset', input)
  state = { ...state, qualityPreset: input }
  return state
}

const SetLayerHeight = (state, input) => {
  state = { ...state, layerHeight: !state.layerHeight }
  return state
}

const actions = {ToggleBrim, ToggleSupport, SetLayerHeight, SetQualityPreset}
export {actions}

const PrintSettings = (state) => {

  const selectedSupportMaterial = 'pva'

  const printCores = ['BB 0.4', 'AA 0.4']

  const {t, support, brim} = state

  const layerHeights = [0.2, 0.15, 0.1, 0.06]
  const qualityPresets = ['draft', 'fast', 'normal', 'high']

  const layerHeightNames = {
    '0.2': t('activity_print_settings_text_draft'),
    '0.15': t('activity_print_settings_text_fast'),
    '0.1': t('activity_print_settings_text_normal'),
    '0.06': t('activity_print_settings_text_high')
  }
  const layerHeightUnit = 'mm'

  const layerHeightButtons = layerHeights.map(function (height) {
    const qualityPreset = `${layerHeightNames[height]}`
    const qualityDetails = `${height} ${layerHeightUnit}`
    const isSelected = state.qualityPreset === qualityPreset
    return <li className={classNames({ 'selected': isSelected })}>
             <button className='SetQualityPreset'>
               <h2>{qualityPreset}</h2>
               <div>
                 {qualityDetails}
               </div>
             </button>
           </li>
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
                <input type='checkbox' checked={support.toggled} className='.ToggleSupport'/>
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
                <input type='checkbox' checked={brim.toggled} className='.ToggleBrim'/>
              </h1>
             </header>
             <div disabled={brim.toggled ? false : 'disabled'}>
               {t('activity_print_settings_text_brim_description')}
             </div>
           </section>
         </section>
}

export default PrintSettings
