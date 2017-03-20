import classNames from 'classnames'
import { div, span, button, li, ul, h2, section, table, th, tr, td } from '@cycle/dom'
import {propEq, find} from 'ramda'

import {videoIconSvg, playIconSvg, pauseIconSvg} from './widgets/icons'
import icon from './widgets/icon'
import renderElipsisSpinner from './widgets/spinner/elipsisSpinner'

export default function drawPrintersList (state) {
  const printers = table('.printersList', state.printing.printers
    .map(function (printer) {
      const isSelected = state.printing.activePrinterId === printer.id
      const isClaimed = printer.claimed
      const isConnected = printer.claimed // FIXME: for now reusing claimed state
      const isPaused = true
      const activePrinter = find(propEq('id', state.printing.activePrinterId))(state.printing.printers)

      const printerName = printer.friendlyName ? printer.friendlyName : printer.name
      const printerText = isSelected ? `${printerName} ${state.printing.printerStatus.message}` : printerName

      const t0Temp = isConnected ? '190°C' : ''
      const t1Temp = isConnected ? '205°C' : ''
      const bedTemp = isConnected ? '65°C' : ''

      const classes = classNames({'.selected': isSelected, '.printerL': true})

      const claimToggler = isClaimed // buttons to claim / unclaim printer
        ? td('.claimer .unClaim .claimed', {attrs: {'data-id': printer.id}}, 'unClaim')
        : td('.claimer .claim', {attrs: {'data-id': printer.id}}, 'claim')

      const pauseResumeButton = isClaimed ? (isPaused ? icon(playIconSvg) : icon(pauseIconSvg)) : ''
      const videoFramesButton = isClaimed ? icon(videoIconSvg) : ''
      let printerBusy = true //state.printing.activePrinterId === printer.id && state.printing.printerStatus.busy //FIXME: how to do it per printer ?
      if(state.printing.activePrinterId === printer.id)
      {
        printerBusy = state.printing.printerStatus.busy
      }

      return tr(classes, {attrs: {'data-id': printer.id}}, [
        td(printerText),
        td(printerBusy? 'busy': 'free'),
        /*td(isConnected ? 'connected' : 'not connected'),
        td([pauseResumeButton]),

        td([videoFramesButton]),

        td(t0Temp),
        td(t1Temp),
        td(bedTemp),*/

        /*td([
          span('.gnok', 'foobar')
        ]),*/
        claimToggler
      ])
    })
  )
  const noPrinters = table('.printersList', [
    tr('.empty',[
      renderElipsisSpinner()
    ])
    //tr([td('please wait fetching printers')])
  ])
  const printerSetup = section('', [
    state.printing.printers.length > 0 ? printers : noPrinters
  ])

  const newPrintDisabled = state.buildplate.entities.length === 0 || state.printing.printerStatus.busy === true
  return printerSetup
}
