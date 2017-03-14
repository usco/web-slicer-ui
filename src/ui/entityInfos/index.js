import {div} from '@cycle/dom'
import {domEvent, makeStateAndReducers$, imitateXstream, fromMost} from '../../utils/cycle'
import {renderPositionUi} from './position'
import {renderRotationUi} from './rotation'
import {renderScaleUi} from './scale'

require('./style.css')

const init = (state) => {
  console.log('init entityInfos state', state)
  return state
}

export const actions = {
  init
}

const view = function (state) {
  return div('EntityInfos', [
    renderPositionUi(state),
    renderRotationUi(state),
    renderScaleUi(state)
  ])
}

function EntityInfos (sources) {
  const _domEvent = domEvent.bind(null, sources)

  const actions$ = {
  }
  const {state$, reducer$} = makeStateAndReducers$(actions$, actions, sources)

  return {
    DOM: fromMost(imitateXstream(state$).map(state => state.buildplate).skipRepeats().map(view)),
    onion: reducer$
  }
}

export default EntityInfos
