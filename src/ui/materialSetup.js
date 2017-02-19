import classNames from 'classnames'
import { html } from 'snabbdom-jsx'



/*function Counter(sources) {
  const init = () => ({ count: 0, toggled: true, text:'yup, some text' })
  const inc = (state, input) => ({...state, count: state.count + 1 })
  const dec = (state, input) => ({...state,  count: state.count - 1 })
  const setText = (state, input) => ({...state,  text: input })
  const toggle = (state, input) => ({...state,  toggled: !state.toggled })

  const view = state => div([
    div(state.count.toString()),
    div('Toggled: '+state.toggled),
    button('.toggle','toggle'),
    state.toggled ? div('.toggleable', [
      button('.inc', '+'),
      button('.dec', '-'),
      input('.input',{attrs: {type: 'text', value:state.text}})
    ]) : null
  ])

  const _domEvent = domEvent.bind(null, sources)
  const incAction$ = _domEvent('.inc', 'click')
  const decAction$ = _domEvent('.dec', 'click')
  const setTextAction$ = xs.merge(
    _domEvent('.input', 'input'),
    _domEvent('.input', 'change')
    )
  .map(e=>e.target.value)
  const toggleAction$ = _domEvent('.toggle', 'click')

  const {state$, reducer$} = makeStateAndReducers$({incAction$, decAction$, setTextAction$, toggleAction$}, {init, inc, dec, setText, toggle}, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}*/

const MaterialSetup = (state) => {
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
export default MaterialSetup
