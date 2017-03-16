import {b, div, span, button} from '@cycle/dom'
import classes from 'classnames'

require('./style.css')

const getToolTip = (tooltip, toggleCondition) => !toggleCondition ? {'data-tooltip': tooltip} : undefined

export default function Menu (options) {
  const defaults = {
    toggled: false,
    disabled: false,

    icon: undefined,
    klass: '',
    wrapperKlass: '',
    arrow: true,

    contentPosition: 'right',
    subItems: false,

    tooltip: '',
    tooltipPos: 'bottom',

    content: undefined
  }
  const {toggled, disabled, icon, klass, wrapperKlass, arrow,
    contentPosition, subItems, tooltip, tooltipPos, content} = {...defaults, ...options}

  const subItemsIndicator = subItems ? span('.subItemsIndicator') : undefined
  // arrow related
  const borderNotch = arrow ? b('.border-notch notch') : undefined
  const notch = arrow ? b('.notch') : ''

  const togglerButton = button({
    props: {
      disabled: disabled,
      className: classes(klass, `tooltip-${tooltipPos}`, {active: toggled})
    },
    attrs: getToolTip(tooltip, toggled)
  },
    [
      icon ? span({props: {innerHTML: icon}}) : 'some text',
      subItemsIndicator
    ]
  )

  let innerContent = ''
  if (content !== undefined && toggled) {
    const contentClassNames = classes('menu', `menu-${contentPosition}`, {'active-content': toggled, arrowOffset: arrow})
    innerContent = div({props: {className: contentClassNames}}, [
      content,
      borderNotch,
      notch
    ])
  }

  const rootClassNames = classes(wrapperKlass, 'toolTipButtonContainer', {disabled})
  return span({props: {className: rootClassNames}}, [
    togglerButton,
    innerContent
  ])
}
