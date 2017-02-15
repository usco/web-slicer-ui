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

  const layerHeights = [0.2, 0.15, 0.1, 0.06]
  const layerHeightNames = {
    '0.2': t('activity_print_settings_text_draft'),
    '0.15': t('activity_print_settings_text_fast'),
    '0.1': t('activity_print_settings_text_normal'),
    '0.06': t('activity_print_settings_text_high')
  }
  const layerHeightUnit = 'mm'

  const layerHeightButtons = layerHeights.map(function (height) {
    const buttonText = `${layerHeightNames[height]}\n${height} ${layerHeightUnit}`
    return <li>
      <button>{buttonText}</button>
    </li>
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
               {t('activity_print_settings_layer_height_description')}
             </header>
             <ul>
              {layerHeightButtons}
             </ul>
           </section>
         </section>
}

export default PrintSettings
