const most = require('most')
import {queryEndpoint} from './umc'

export function printers (id) {
  return queryEndpoint(`/printers`)
    .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
}

export function claimedPrinters (id) {
  return queryEndpoint(`/printers/claimed`)
    .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
}

export function printerName (id) {
  return queryEndpoint(`/printers/${id}/name`)
}

export function printerLookup (id) {
  return queryEndpoint(`/printers/lookup/${id}`)
}

export function printerInfos (id) {
  return queryEndpoint(`/printers/${id}/info`)
}

export function printerSystem (id) {
  return queryEndpoint(`/printers/${id}/system`)
    .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
}

export function printerStatus (id) {
  return queryEndpoint(`/printers/${id}/status`)
}

export function printerVariant (id) {
  return queryEndpoint(`/printers/${id}/system/variant`)
    .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
}

export function claimPrinter (id) {
  return queryEndpoint(`/printers/${id}/claim`, {method: 'POST'})
    .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
}

export function unclaimPrinter (id) {
  return queryEndpoint(`/printers/${id}/claim`, {method: 'DELETE'})
    .flatMapError(error => most.of({error: error}))// TODO: dispatch errors
}

export function printerCamera (id) {
  return queryEndpoint(`/printers/${id}/camera`, { encoding: null, parse: false, json: false })//, {'Content-Type': 'image/jpeg'}
}

export function uploadAndStartPrint (id, params, file) {
  const defaults = {
    filename: 'test.stl',
    slicing_quality: 'draft', // draft|fast|normal|high
    slicing_adhesion: false,
    slicing_support_extruder: -1, // -1,1,2
    machine_type: 'ultimaker3',
    material_guid: '',
    mesh_translations: false
  }
  params = {...defaults, ...params}

  const formData = new FormData()
  for (name in params) {
    formData.append(name, params[name])
  }
  formData.append('file', file, params.filename)

  return queryEndpoint(`/printers/${id}/print/upload`, {method: 'POST', body: formData})
}

export function pausePrint (id) {
  return queryEndpoint(`/printers/${id}/print/pause`, {method: 'POST'})
}

export function resumePrint (id) {
  return queryEndpoint(`/printers/${id}/print/resume`, {method: 'POST'})
}

export function abortPrint (id) {
  return queryEndpoint(`/printers/${id}/print/abort`, {method: 'POST'})
}
