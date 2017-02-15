import { h, render } from 'preact-cycle'
import classNames from 'classnames'
/** @jsx h */

const MaterialSetup = ({state}) => {
  const mutation = state.mutation
  const {t} = state
  const header = {
    valid: true,
  }

 return <section>
  <header>

  </header>
  <section className='info'>
    {t('activity_print_settings_text_the_app_only_supports')}
  </section>
  <div>
    The printer is currently loaded with
  </div>

  <div>

  </div>


 </section>
}
export default MaterialSetup
