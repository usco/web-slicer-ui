import {div, span, label} from '@cycle/dom'

import Menu from '../widgets/Menu'
import checkbox from '../widgets/Checkbox'
import {transformInputs} from './helpers'
import {pluck, find, filter} from 'ramda'

const icon = `<svg viewBox="0 0 29 29" preserveAspectRatio="xMidYMid meet" class='icon'
version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <!-- Generator: Sketch 3.8.3 (29802) - http://www.bohemiancoding.com/sketch -->
    <title>move</title>
    <desc>Created with Sketch.</desc>
    <defs></defs>
    <g id="icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <path d="M15,14 L23,14 L23,15 L14,15 L14,14.5 L14,6 L15,6 L15,14 Z M23,10 L23,19 L29,14.5 L23,10 Z M6,10 L6,19 L0,14.5 L6,10 Z M14,14 L6,14 L6,15 L14,15 L14,14 Z M19,23 L10,23 L14.5,29 L19,23 Z M15,15 L15,23 L14,23 L14,15 L15,15 Z M19,6 L10,6 L14.5,0 L19,6 Z" id="move" fill="#000000"></path>
    </g>
</svg>`

export function renderPositionUi (state) {
  const {settings, activeTool, selections, entities} = state
  const toggled = activeTool === 'translate'
  const disabled = selections.instIds.length === 0

  const transformStep = 0.1
  const precision = 2

  // match entities by id from the selections list
  const idMatch = entity => selections.instIds.indexOf(entity.meta.id) > -1
  const transforms = pluck('transforms')(filter(idMatch, entities))

  // compute the average position, since we are dealing with 0...n entities
  const avg = pluck('pos')(transforms)
    .reduce(function (acc, cur) {
      return !acc ? cur : [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
    }, undefined)

  const values = avg || [0, 0, 0]

  const subTools = span('.movingSubTools', [
    div('.transformsGroup',
      transformInputs({fieldName: 'pos', unit: '', step: transformStep, values, precision})
    ),
    div('.optionsGroup', [
      label('.menuContent', [
        checkbox({id: 'snapTranslation', className: 'snapTranslation', checked: settings.snapRotation}),
        'snap translation'
      ])
    ])
  ])

  return Menu({toggled, disabled, icon, wrapperKlass: 'positionMenu', klass: 'toTranslateMode', tooltip: 'move', tooltipPos: 'right', content: subTools})
}
