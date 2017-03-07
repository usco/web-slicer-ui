//import {keycodes, isValidElementEvent} from '../../../interactions/keyboard'
import {merge, fromEvent} from 'most'
import {domEvent} from '../../../utils/cycle'

export default function intent (sources, params) {
  const checked = event => event.target.checked
  const _domEvent = domEvent.bind(null, sources)

  const toggleSnapScaling$ = _domEvent('.menuContent .snapScaling', 'change').map(checked)
  const toggleUniformScaling$ = _domEvent('.menuContent .uniformScaling', 'change').map(checked)
  const toggleSnapRotation$ = _domEvent('.menuContent .snapRotation', 'change').map(checked)
  const toggleSnapTranslation$ = _domEvent('.menuContent .snapTranslation', 'change').map(checked)

  /* const keyUps$ = fromEvent(document, 'keyup') // _domEvent(":root","keyup")
    .filter(isValidElementEvent) // stop for input, select, and textarea etc
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 'm').map('translate'),
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 't').map('translate'),
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 'r').map('rotate'),
    keyUps$.map(e => keycodes[e.keyCode]).filter(k => k === 's').map('scale') */

  const setActiveTool$ = merge(
    _domEvent('.toNameAndColorMode', 'click').constant('nameAndColor'),
    _domEvent('.toTranslateMode', 'click').constant('translate'),
    _domEvent('.toRotateMode', 'click').constant('rotate'),
    _domEvent('.toScaleMode', 'click').constant('scale'),
    _domEvent('.toMirrorMode', 'click').constant('mirror'),
  )
    /* .scan(function (acc, val) {
      if (acc === val && val !== undefined) {
        acc = undefined
      } else {
        acc = val
      }
      return acc
    }) */

  return {
    setActiveTool$,
    toggleSnapScaling$,
    toggleUniformScaling$,
    toggleSnapRotation$,
    toggleSnapTranslation$
  }
}
