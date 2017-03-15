import * as R from 'ramda'

export const ClaimPrinter = (state, input) => {
  console.log('ClaimPrinter', input)
  const index = R.findIndex(R.propEq('id', state.printing.activePrinterId))(state.printing.printers)

  if (index !== -1) {
    const activePrinter = state.printing.printers[index]
    const printers = R.update(index, {...activePrinter, claimed: input}, state.printing.printers)
    state = { ...state, printing: {...state.printing, printers} }
  }
  return state
}

export const UnClaimPrinter = (state, input) => {
  console.log('UnClaimPrinter', input)
  const index = R.findIndex(R.propEq('id', state.printing.activePrinterId))(state.printing.printers)

  if (index !== -1) {
    const activePrinter = state.printing.printers[index]
    const printers = R.update(index, {...activePrinter, claimed: input}, state.printing.printers)
    state = { ...state, printing: {...state.printing, printers} }
  }
  return state
}

export const SelectPrinter = (state, activePrinterId) => {
  console.log('SelectPrinter', activePrinterId)
  // FIXME: activePrinter is a computed property how do we deal with it ?
  // const activePrinter = R.find(R.propEq('id', state.printing.activePrinterId))(state.printing.printers)
  state = { ...state, printing: {...state.printing, activePrinterId} }
  console.log('state', state)
  return state
}

export const SetPrinters = (state, printers) => {
  console.log('SetPrinters', printers)
  state = { ...state, printing: {...state.printing, printers} }
  return state
}

export const SetActivePrinterInfos = (state, input) => {
  console.log('SetActivePrinterInfos', input)
  const index = R.findIndex(R.propEq('id', state.printing.activePrinterId))(state.printing.printers)

  if (index !== -1) {
    const activePrinter = state.printing.printers[index]
    const printers = R.update(index, {...activePrinter, infos: input}, state.printing.printers)
    state = { ...state, printing: {...state.printing, printers} }
  }
  return state
}

export const SetActivePrinterSystem = (state, input) => {
  console.log('SetActivePrinterSystem', input)
  const index = R.findIndex(R.propEq('id', state.printing.activePrinterId))(state.printing.printers)
  const inputDefaults = {'variant': 'Ultimaker 3'} // if there is no 'variant' set it to Ultimaker 3

  if (index !== -1) {
    const activePrinter = state.printing.printers[index]
    input = {...inputDefaults, ...input}
    const printers = R.update(index, {...activePrinter, system: input}, state.printing.printers)
    state = { ...state, printing: {...state.printing, printers} }
  }
  return state
}

export const SetCameraFrame = (state, frame) => { // FIXME: purely UI , does not belong here ?
  state = { ...state, printing: {...state.printing, frame}}
  return state
}

export const SetPrinterStatus = (state, printerStatus) => ({ ...state, printing: {...state.printing, printerStatus} })

export const RefreshPrintersList = (state, input) => ({ ...state, printing: {...state.printing, printersStatus: 'fetching printers, please wait ...' }})

export const PauseResumePrint = (state, input) => {
  console.log('PauseResumePrint')
  // state.status === 'paused' ? 'running' : 'paused'
  state = { ...state, print: {...state.print, paused: input} }
  return state
}

export const StartPrint = (state, input) => ({ ...state, printing: {...state.printing, printerStatus: {message: 'print requested ...'}} })
export const AbortPrint = (state, input) => ({ ...state, printing: {...state.printing, printerStatus: {message: 'print abort requested ...'}} })
export const printStarted = (state, status) => ({ ...state, printing: {...state.printing, printerStatus: status }})
export const printAborted = (state, input) => ({ ...state, printing: {...state.printing, printerStatus: {message: 'print aborted'}} })
