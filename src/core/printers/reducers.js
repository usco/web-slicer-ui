import * as R from 'ramda'

export const ClaimPrinter = (state, input) => {
  console.log('ClaimPrinter', input)
  const index = R.findIndex(R.propEq('id', state.activePrinterId))(state.printers)

  if (index !== -1) {
    const activePrinter = state.printers[index]
    const printers = R.update(index, {...activePrinter, claimed: input}, state.printers)
    state = { ...state, printers }
  }
  return state
}

export const UnClaimPrinter = (state, input) => {
  console.log('UnClaimPrinter', input)
  const index = R.findIndex(R.propEq('id', state.activePrinterId))(state.printers)

  if (index !== -1) {
    const activePrinter = state.printers[index]
    const printers = R.update(index, {...activePrinter, claimed: input}, state.printers)
    state = { ...state, printers }
  }
  return state
}

export const SelectPrinter = (state, input) => {
  console.log('SelectPrinter', input)
  // FIXME: activePrinter is a computed property how do we deal with it ?
  // const activePrinter = R.find(R.propEq('id', state.activePrinterId))(state.printers)
  state = { ...state, activePrinterId: input }
  console.log('state', state)
  return state
}

export const SetPrinters = (state, input) => {
  console.log('SetPrinters', input)
  state = { ...state, printers: input }
  return state
}

export const SetActivePrinterInfos = (state, input) => {
  console.log('SetActivePrinterInfos', input)
  const index = R.findIndex(R.propEq('id', state.activePrinterId))(state.printers)

  if (index !== -1) {
    const activePrinter = state.printers[index]
    const printers = R.update(index, {...activePrinter, infos: input}, state.printers)
    state = { ...state, printers }
  }
  return state
}

export const SetActivePrinterSystem = (state, input) => {
  console.log('SetActivePrinterSystem', input)
  const index = R.findIndex(R.propEq('id', state.activePrinterId))(state.printers)
  const inputDefaults = {'variant': 'Ultimaker 3'} // if there is no 'variant' set it to Ultimaker 3

  if (index !== -1) {
    const activePrinter = state.printers[index]
    input = {...inputDefaults, ...input}
    const printers = R.update(index, {...activePrinter, system: input}, state.printers)
    state = { ...state, printers }
  }
  return state
}

export const SetCameraImage = (state, input) => { // FIXME: purely UI , does not belong here
  state = { ...state, image: input }
  return state
}

export const PauseResumePrint = (state, input) => {
  console.log('PauseResumePrint')
  // state.status === 'paused' ? 'running' : 'paused'
  state = { ...state, print: {...state.print, paused: input} }
  return state
}

export const StartPrint = (state, input) => ({ ...state, printStatus: 'print requested ...' })
export const AbortPrint = (state, input) => ({ ...state, printStatus: 'print abort requested ...' })

export const RefreshPrintersList = (state, input) => state

export const printStarted = (state, input) => ({ ...state, printStatus: 'print running' })
export const printAborted = (state, input) => ({ ...state, printStatus: 'print aborted' })

/*const printerActios = {
  SetPrinters,
  SelectPrinter,
  ClaimPrinter,
  UnClaimPrinter,
  SetActivePrinterInfos,
  SetActivePrinterSystem,
  SetCameraImage,
  StartPrint
}*/
