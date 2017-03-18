import {span, label} from '@cycle/dom'

export function withToolTip (item, tooltip = '', tooltipPos = 'bottom') {
  let moddedItem = item
  // item.data = {...item.data, attrs: {'data-tooltip': tooltip}}
  item.sel = `${item.sel}.tooltipWrapper`// `${item.sel}.tooltip-${tooltipPos}`
  const tooltipElement = span(`.tooltip.${tooltipPos}`, [tooltip])
  let children = item.children ? item.children : []
  if (item.text) {
    children.push(label(item.text))
  }
  children.push(tooltipElement)
  item.children = children
  // item.children = item.children ? [...item.children, tooltipElement] : [tooltipElement]

  // item.props = {...item.props, className:`tooltip-${tooltipPos}`}
  return item
}
