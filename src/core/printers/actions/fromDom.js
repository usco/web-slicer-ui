import {domEvent, imitateXstream} from '../../../utils/cycle'

export default function intent (sources, params) {
  const _domEvent = domEvent.bind(null, sources)

  const RefreshPrintersList$ = imitateXstream(_domEvent('.RefreshPrintersList', 'click').map(x => true))
  // fetch data for the selectedprinter
  const SelectPrinter$ = imitateXstream(_domEvent('.printerL', 'click').map(x => (x.currentTarget.dataset.id)))
  // acquire/claim a printer
  const ClaimPrinter$ = imitateXstream(_domEvent('.claim', 'click')).map(x => (x.currentTarget.dataset.id))
  // unclaim a printer
  const UnClaimPrinter$ = imitateXstream(_domEvent('.unClaim', 'click')).map(x => (x.currentTarget.dataset.id))

  const StartPrint$ = imitateXstream(_domEvent('.StartPrint', 'click'))// TODO add out of bound checks

  const AbortPrint$ = imitateXstream(_domEvent('.abort', 'click'))

  return {
    RefreshPrintersList$,
    SelectPrinter$,
    ClaimPrinter$,
    UnClaimPrinter$,
    StartPrint$,
    AbortPrint$
  }
}
