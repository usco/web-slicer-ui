import {domEvent} from '../../../utils/cycle'

export default function intent (sources, params) {
  const _domEvent = domEvent.bind(null, sources)

  const RefreshPrintersList$ = _domEvent('.RefreshPrintersList', 'click').map(x => true)
  // fetch data for the selectedprinter
  const SelectPrinter$ = _domEvent('.printerL', 'click').map(x => (x.currentTarget.dataset.id))
  // acquire/claim a printer
  const ClaimPrinter$ = _domEvent('.claim', 'click').map(x => (x.currentTarget.dataset.id))
  // unclaim a printer
  const UnClaimPrinter$ = _domEvent('.unClaim', 'click').map(x => (x.currentTarget.dataset.id))

  const StartPrint$ = _domEvent('.startPrint', 'click')// TODO add out of bound checks

  // this is from MonitorPrint
  const PauseResumePrint$ = _domEvent('.pauseResume', 'click')

  const AbortPrint$ = _domEvent('.abort', 'click')

  // FIXME: temp workarounds
  // this is from printSettings
  const SetQualityPreset$ = _domEvent('.SetQualityPreset', 'click').map(x => (x.currentTarget.dataset.index))
  const ToggleBrim$ = _domEvent('.ToggleBrim', 'click').map(x => x.target.value)
  const ToggleSupport$ = _domEvent('.ToggleSupport', 'click').map(x => x.target.value)

  return {
    RefreshPrintersList$,
    SelectPrinter$,
    ClaimPrinter$,
    UnClaimPrinter$,

    StartPrint$,
    PauseResumePrint$,
    AbortPrint$,

    SetQualityPreset$,
    ToggleBrim$,
    ToggleSupport$
  }
}
