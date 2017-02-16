import { h, render } from 'preact-cycle'
import classNames from 'classnames'
/** @jsx h */

const MaterialSetup = ({state}) => {
  const mutation = state.mutation
  const {t} = state
  const header = {
    valid: true,
  }
  //TODO check materials combo
  const validMaterialCoresCombo = true

  if(validMaterialCoresCombo){
    //activity_check_material_textview_material_invalid
  }
  const coresAndMaterials = ['Foo','Bar']
  const coresAndMaterialsUi = coresAndMaterials.map(function(coresAndMaterial, index){
    return <li>(extruder{index+1})</li>
  })

 return <section className='materialSetup'>
  <header>

  </header>
  <section className='info'>
    {t('activity_print_settings_text_the_app_only_supports')}
  </section>
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
