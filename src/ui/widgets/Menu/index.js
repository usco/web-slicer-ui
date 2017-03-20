import {b, div, span, button} from '@cycle/dom'
import classes from 'classnames'

require('./style.css')

export default function Menu (options) {
  const defaults = {
    toggled: false,
    disabled: false,

    name: '',
    icon: undefined,
    klass: '',
    wrapperKlass: '',
    arrow: true,

    contentPosition: 'right',
    subItems: false,

    tooltip: undefined,
    tooltipPos: 'bottom',

    content: undefined
  }
  const {toggled, disabled, icon, name, klass, wrapperKlass, arrow,
    contentPosition, subItems, tooltip, tooltipPos, content} = {...defaults, ...options}

  const subItemsIndicator = subItems ? span('.subItemsIndicator') : undefined
  // arrow related
  const borderNotch = arrow ? b('.border-notch notch') : undefined
  const notch = arrow ? b('.notch') : ''
  const tooltipElement = tooltip ? span(`.tooltip.${tooltipPos}`, [tooltip]) : undefined

  const togglerButton = button({
    props: {
      disabled: disabled,
      className: classes(klass, `tooltipWrapper`, 'menuToggler', {active: toggled})
    }
  },
    [
      icon ? span({props: {innerHTML: icon}}) : name,
      subItemsIndicator,
      toggled ? undefined : tooltipElement// if the menu is not toggled, show tooltip
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
