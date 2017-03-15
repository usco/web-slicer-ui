import { h } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
import classes from 'classnames'

require('./style.css')

const getToolTip = (tooltip, toggleCondition) => !toggleCondition ? {'data-tooltip': tooltip} : undefined

export default function Menu (options) {
  const defaults = {
    toggled: false,
    disabled: false,

    icon: '',
    klass: '',
    wrapperKlass: '',
    arrow: true,

    contentPosition: 'right',
    subItems: false,

    tooltip: '',
    tooltipPos: 'bottom',

    content: undefined
  }
  const {toggled, disabled, icon, klass, wrapperKlass, arrow, contentPosition, subItems, tooltip, tooltipPos, content} = Object.assign({}, defaults, options)

  const subItemsIndicator = subItems ? <span className='subItemsIndicator' /> : ''
  // arrow related
  const borderNotch = arrow ? <b className='border-notch notch' /> : ''
  const notch = arrow ? <b className='notch' /> : ''

  const button = h('button', {
    props: {
      disabled: disabled,
      className: classes(klass, `tooltip-${tooltipPos}`, {active: toggled})
    },
    attrs: getToolTip(tooltip, toggled)
  },
    [
      h('span', {props: {innerHTML: icon}}),
      subItemsIndicator
    ])

  let innerContent = ''
  if (content !== undefined && toggled) {
    innerContent = <div
      className={classes('menu', `menu-${contentPosition}`, {'active-content': toggled, arrowOffset: arrow})}>
      {content}
      {borderNotch}
      {notch}
    </div>
  }

  const rootClassNames = classes('toolTipButtonContainer', wrapperKlass, {disabled})
  return <span className={rootClassNames}>
    {button}
    {innerContent}
  </span>
}
