// import {keycodes, isValidElementEvent} from '../../../interactions/keyboard'
import {merge, fromEvent} from 'most'
import {domEvent} from '../../../utils/cycle'
import {toRadian} from '../../../utils/formatters'

export default function intent (sources, params) {
  const checked = event => event.target.checked
  const _domEvent = domEvent.bind(null, sources)

  const toggleSnapTranslation$ = _domEvent('.menuContent .snapTranslation', 'change').map(checked)
  const toggleSnapRotation$ = _domEvent('.menuContent .snapRotation', 'change').map(checked)
  const toggleSnapScaling$ = _domEvent('.menuContent .snapScaling', 'change').map(checked)
  const toggleUniformScaling$ = _domEvent('.menuContent .uniformScaling', 'change').map(checked)

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
    _domEvent('#viewer', 'click').constant(undefined)// to disable active tool by clicking 'outside'
  )

  const changeTransforms$ = merge(
    _domEvent('.transformsInput', 'change'),
    _domEvent('.transformsInput', 'blur'),
    _domEvent('.transformsInput', 'input'),

    // special one for scaling
    _domEvent('.transformsInputPercent', 'change'),
    _domEvent('.transformsInputPercent', 'blur'),
    _domEvent('.transformsInputPercent', 'input')
  )
  .map(function (e) {
    let val = parseFloat(e.target.value)
    const attributes = e.target.dataset
    // console.log('attributes', attributes)
    let dtrans = attributes.transform
    let [trans, idx, extra] = dtrans.split('_')
    if (trans === 'rot') {
      val = toRadian(val)
    } else if (trans === 'sca') {
      val = extra === 'percent' ? val / 100 : val
    }

    return {val, trans, extra, idx: parseInt(idx, 10)}
  })
  // .filter(exists)
  // .filter(data => isNumber(data.val))
  .skipRepeats()
  .multicast()
  .tap(e => console.log('foooobarr', e))

  /* const changePosition$ = changeTransforms$
    .filter(c => c.trans === 'pos')

  const changeRotation$ = changeTransforms$
    .filter(c => c.trans === 'rot')
    .map(change => ({...change, val: toRadian(change.val)}))// convert rotated values back from degrees to radians

  const changeScale$ = changeTransforms$
    .filter(c => c.trans === 'sca')
    .map(change => {
      return {...change, val: change.extra === 'percent' ? change.val / 100 : change.val}
    }) */

  const resetScaling$ = _domEvent('.resetScaling', 'click').map(x => true)

  return {
    setActiveTool$,
    toggleSnapScaling$,
    toggleUniformScaling$,
    toggleSnapRotation$,
    toggleSnapTranslation$,

    changeTransforms$,
    /* changePosition$,
    changeRotation$,
    changeScale$ */
    resetScaling$
  }
}
