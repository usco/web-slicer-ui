
export function withToolTip (item, tooltip = '', tooltipPos = 'bottom') {
  let moddedItem = item
  item.data = {...item.data, attrs: {'data-tooltip': tooltip}}
  item.sel = `${item.sel}.tooltip-${tooltipPos}`
  // item.props = {...item.props, className:`tooltip-${tooltipPos}`}
  return item
}
