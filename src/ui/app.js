import { h, render } from 'preact-cycle'
import classNames from 'classnames'
/** @jsx h */
import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'

const App = (state) => {
  console.log('state', state)
  return <div id='app'>
           <h1>{state.t('app_name')}</h1>
           <h1> Print Settings </h1>
           <button>
             Next step
           </button>
           <PrintSettings state={state} />
           <MaterialSetup/>
         </div>
}

export default App
