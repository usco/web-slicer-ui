import classNames from 'classnames'
import PrintSettings from './printSettings'
import MaterialSetup from './materialSetup'
import {merge} from 'most'

//query printer for infos
// => get printhead & material infos
// => get transformation matrix of active object
// => upload file & start print
// => provide controls to pause/resume abort print

function App(sources) {
  const init = () => ({})
  //go to next step
  const NextStep = (state, input) => ({ ...state, currentStep: Math.max(state.currentStep+1, state.steps.length-1) })
  const PrevStep = (state, input) => ({ ...state, currentStep: Math.min(state.currentStep-1, 0) })
  const StartPrint = (state, input) => ({...state, printStatus: 'started' })

  const view = (state) => {
    //console.log('state', state)
    const {steps, currentStep} = state
    const stepContents = [
      <MaterialSetup state={state} />,
      <PrintSettings state={state} />
    ]
    const prevStepUi = currentStep > 0 ? <button className='PrevStep'> Previous step </button> : null
    const nextStepUi = currentStep < steps.length -1 ? <button className='NextStep'> Next step </button> : null
    const startPrintUi = currentStep === steps.length -1 ? <button className='StartPrint'> Start Print</button> : null

    //<h1>{t('app_name')}</h1>
    return <div id='app'>
             <section id='wrapper'>
              <section id='printerPicker'>
                <div> Select printer </div>
              </section>
               <section id='viewer'>
                3D viewer here
               </section>
               <section id='settings'>
                <h1>{steps[currentStep].name} {prevStepUi} {nextStepUi} {startPrintUi}</h1>
                {stepContents[currentStep]}
               </section>
             </section>
           </div>
  }

  const _domEvent = domEvent.bind(null, sources)
  const incAction$ = _domEvent('.inc', 'click')
  const decAction$ = _domEvent('.dec', 'click')
  const setTextAction$ = merge(
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
}

export default App
