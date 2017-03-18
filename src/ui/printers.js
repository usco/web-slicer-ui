import { div, button, li, ul, h1, h2, p, span, section} from '@cycle/dom'

import Menu from './widgets/Menu'
import {withToolTip} from './widgets/utils'
import {printerIconSvg} from './widgets/icons'
import tooltip from './widgets/Tooltip'
import icon from './widgets/icon'

import drawPrintersList from './drawPrintersList'

export default function printers (state) {
  const subItems = drawPrintersList(state)
  
  const printersMenu = Menu({toggled: state.printerListToggled, contentPosition: 'bottom', arrow:false,
    wrapperKlass: 'printersMenu', klass: 'printerMenuToggle',
    tooltip: 'printers', tooltipPos: 'left', content: subItems, name: 'printers'})

  return printersMenu
}
