// setModelUri('http://localhost:8080/data/sanguinololu_enclosure_full.stl')
import callBackToStream from '../utils/most/callBackToStream'
import { formatRawMachineData } from '@usco/printing-utils'

export default function windowApiDriver (out$) {
  const makeModelUriFromCb = callBackToStream()
  const modelUri$ = makeModelUriFromCb.stream

  const makeMachineParamsFromCb = callBackToStream()
  const machineParams$ = makeMachineParamsFromCb.stream.map(formatRawMachineData)
  // ugh but no choice
  window.nativeApi = {}
  window.nativeApi.setModelUri = makeModelUriFromCb.callback
  window.nativeApi.setMachineParams = makeMachineParamsFromCb.callback
  window.nativeApi.heartbeat = function () { // ping pong
    return true
  }

  return {
    machineParams$,
    modelUri$
  }
}
