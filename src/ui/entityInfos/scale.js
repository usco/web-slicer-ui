import {div, span, label, a} from '@cycle/dom'
import Menu from '../widgets/Menu'
import checkbox from '../widgets/Checkbox'
import {transformInputs} from './helpers'

import {absSizeFromBBox} from '../../utils/formatters'
import {pluck, filter} from 'ramda'

const icon = `<svg viewBox="0 0 24 21" preserveAspectRatio="xMidYMid meet" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>scale</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M21.251,0 L5.149,0 L7.833,6.999 L1.701,7 L3.401,11.667 L0,21 L2.465,21 L13.606,21 L23.935,21 L18.569,6.999 L21.251,0 Z M13.241,20 L10.204,11.667 L11.904,7 L8.903,7 L8.903,6.999 L8.765,6.641 L6.603,1 L19.797,1 L17.635,6.641 L17.497,6.999 L17.635,7.356 L22.481,20 L13.241,20 L13.241,20 Z" id="scale" fill="#000000"></path>
    </g>
</svg>`

export function renderScaleUi (state) {
  const {settings, activeTool, selections, entities} = state
  const toggled = activeTool === 'scale'
  const disabled = selections.instIds.length === 0

  const snapDefaults = 0.1 // snap scaling snaps to tens of percentages
  const transformStep = settings.snapScaling ? snapDefaults : 0.1
  const precision = 2
  const min = 0.01

  const subTools = span('.scalingSubTools .twoColumns', [
    div('.transformsGroup',
      transformInputs({fieldName: 'sca', unit: '', showPercents: true, step: transformStep, values: state.sizeAverage, valuePercents: state.scaleAverage.map(x => x * 100), precision, min,
        disabled: false, extraKlasses: ['absScaling'] })),
    div('.optionsGroup', [
      label('.menuContent', [
        checkbox({id: 'snapScaling', className: 'snapScaling', checked: settings.snapScaling}),
        'snap scaling'
      ])
    ]),
    div('.defaultsGroup', [
      label('.resetScaling', [
        a('.textLink.resetScaling', 'Reset Scaling')
      ])
    ])
  ])

  return Menu({toggled, disabled, icon, wrapperKlass: 'scaleMenu', klass: 'toScaleMode', tooltip: 'scale', tooltipPos: 'right', content: subTools})
}

export function view (state$) {
  return state$.map(renderScaleUi)
}
