import classNames from 'classnames'
import { div, span, button, li, ul, h2, section, table, th, tr, td } from '@cycle/dom'
import {propEq, find} from 'ramda'

import {videoIconSvg, playIconSvg, pauseIconSvg} from './widgets/icons'
import icon from './widgets/icon'


export default function drawPrintersList (state) {
  const printers = table('.printersList', state.printing.printers
    .map(function (printer) {
      const isSelected = state.printing.activePrinterId === printer.id
      const isClaimed = printer.claimed
      const isPaused = true
      const printerText = isSelected ? `${printer.name} ${state.printing.printerStatus.message}` : printer.name

      const classes = classNames({'.selected': isSelected, '.printerL': true})

      const claimButtons = isClaimed // buttons to claim / unclaim printer
        ? button('.unClaim .claimed', {attrs: {'data-id': printer.id}}, 'unClaim')
        : button('.claim', {attrs: {'data-id': printer.id}}, 'claim')

      const pauseResumeButton = isClaimed ? (isPaused ? icon(playIconSvg) : icon(pauseIconSvg)) : ''
      const videoFramesButton = isClaimed ? icon(videoIconSvg) : ''

      return tr(classes, {attrs: {'data-id': printer.id}}, [
        td([printerText]),
        td([pauseResumeButton]),

        td([videoFramesButton]),
        td([claimButtons])

      ])
    })
  )// printerStatus
  const printerSetup = section('', [
    state.printing.printers.length > 0 ? div('Select printer', [printers]) : span('please wait, fetching printers ...')
  ])

  const activePrinter = find(propEq('id', state.printing.activePrinterId))(state.printing.printers)
  // console.log(activePrinter, state.activePrinter)
  const newPrintDisabled = state.buildplate.entities.length === 0 || state.printing.printerStatus.busy === true
  return printerSetup
}
