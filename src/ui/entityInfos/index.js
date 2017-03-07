import {section, div, button, img} from '@cycle/dom'
import {domEvent, makeStateAndReducers$} from '../../utils/cycle'
import {renderPositionUi} from './position'
import {renderRotationUi} from './rotation'
import {renderScaleUi} from './scale'

const init = (state) => {
  console.log('init entityInfos state', state)
  return state
}

export const actions = {
  init
}

const view = function (state) {
  console.log('EntityInfos', state)
  return div('EntityInfos',[
    renderPositionUi(state),
    renderRotationUi(state),
    renderScaleUi(state)
  ])
}
/* section('.MonitorPrint', [
  div('', [
    button('.startpause', state.paused ? 'play' : 'pause'),
    button('.abort', 'abort')
  ]),
  img('.printerCameraFrame', {props: {src: state.image ? state.image : ''}})
]) */

function EntityInfos (sources) {
  const _domEvent = domEvent.bind(null, sources)

  const actions$ = {
    // startpause$, abort$
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}

export default EntityInfos
