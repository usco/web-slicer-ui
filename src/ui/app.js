import { h, render } from 'preact-cycle'
import classNames from 'classnames'
/** @jsx h */
import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'

//go to next step
const NextStep = (state, input) => {
  state = { ...state, currentStep: Math.max(state.currentStep+1, state.steps.length-1) }
  return state
}
const PrevStep = (state, input) => {
  state = { ...state, currentStep: Math.min(state.currentStep-1, 0) }
  return state
}

const App = (state) => {
  //console.log('state', state)
  const {mutation, t, steps, currentStep} = state
  const stepContents = [
    <MaterialSetup state={state} />,
    <PrintSettings state={state} />
  ]
  let prevStepUi = currentStep > 0 ? <button onClick={mutation(PrevStep, state)}> Previous step </button> : null
  let nextStepUi = currentStep < steps.length -1 ? <button onClick={mutation(NextStep, state)}> Next step </button> : null

  return <div id='app'>
           <h1>{t('app_name')}</h1>
           <h1>{steps[currentStep].name}</h1>
           {prevStepUi}{nextStepUi}
           <section>
            {stepContents[currentStep]}
           </section>
         </div>
}

export default App
