import { h, render } from 'preact-cycle'
/** @jsx h */

const Toggle = (state, input) => {
  todo.done = !todo.done
  return state
}

const SetLayerHeight = (state, input) => {
  todo.done = !todo.done
  return state
}

const actions = {Toggle}

const PrintSettings = ({t}) => {

  const selectedSupportMaterial = 'pva'

  const state = {
    support: {toggled: true},
    brim: {toggled: true}
  }
  const {support, brim} = state

  const layerHeights = [0.2, 0.15, 0.1, 0.06]
  const layerHeightNames = {
    '0.2': t('activity_print_settings_text_draft'),
    '0.15': t('activity_print_settings_text_fast'),
    '0.1': t('activity_print_settings_text_normal'),
    '0.06': t('activity_print_settings_text_high')
  }
  const layerHeightUnit = 'mm'

  const layerHeightButtons = layerHeights.map(function (height) {
    const buttonText = `${layerHeightNames[height]}
${height} ${layerHeightUnit}`
    return <li>
             <button>
               {buttonText}
             </button>
           </li>
  })

  const supportMaterials = ['pva', 'pla']

  const supportMaterialsUi = supportMaterials.map(function (supportMaterial) {
    return <div>
             <input
               type="radio"
               name='supportMaterials'
               value={supportMaterial}
               checked={supportMaterial === selectedSupportMaterial}>
             {supportMaterial}
             </input>
             Extruder 1:
             {supportMaterial}
           </div>
  })

  return <section className='printSettings'>
           <header>
             {t('activity_print_settings_text_info')}
           </header>
           <section className='info'>
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
               <h1>{t('activity_print_settings_text_support_structure')} <input type='checkbox' checked={support.toggled} /></h1>
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
               <h1>{t('activity_print_settings_text_adhesion_brim')} <input type='checkbox' checked={brim.toggled} /></h1>
             </header>
             <div disabled={brim.toggled ? false : 'disabled'}>
               {t('activity_print_settings_text_brim_description')}
             </div>
           </section>
         </section>
}

export default PrintSettings
