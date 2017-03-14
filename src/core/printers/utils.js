import * as R from 'ramda'
import {compose, prop, propOr, path, nth, map, pathOr} from 'ramda'

export const pickExtruders = printerInfos => R.prop('extruders', R.head(R.prop('heads', printerInfos)))
export const pickMaterials = extruders => R.map(R.path(['active_material', 'guid']), extruders)
export const pickHotends = extruders => R.map(R.path(['hotend', 'id']), extruders)

export const extruders = compose(
  propOr([], 'extruders'),
  nth(0),
  propOr([], 'heads'),
  propOr({}, 'infos')
)

export const materialGuids = compose(
  map(path(['active_material', 'guid'])),
  extruders,
)

export const hotends = compose(
  map(propOr({temperature: {current: 0, target: 0}}, 'hotend')),
  extruders,
)

export const hotend = extruder => compose(
  propOr({}, 'hotend'),
  nth(extruder),
  extruders,
)

export const bed = compose(
  propOr({temperature: {current: 0, target: 0}}, 'bed'),
  propOr({}, 'infos')
)

// for print jobs
const progress = pathOr(0, ['progress'])
const totalTime = pathOr(0, ['time_total'])
const elapsedTime = pathOr(0, ['time_elapsed'])

export const jobInfos = compose(
  /*data => ({
    progress,
    totalTime,
    elapsedTime
  }),*/
  propOr({}, 'job')
)
export function formatTime (time) {
  const hours = Math.floor(time / 3600)
  time -= hours * 3600
  const minutes = Math.floor(time / 60)
  time -= minutes * 60
  const seconds = parseInt(time % 60, 10)
  return {hours, minutes, seconds}
}//`${hours} hrs: ${mins} : ${seconds}`

/*
materialGuids(activePrinter)
hotend(0)(activePrinter)
hotends(activePrinter)
bed(activePrinter) */

export function extrudersHotendsAndMaterials (printer) {
  let usefulData = {
    extruders: [],
    materials: [],
    hotends: []
  }
  if (printer && printer.hasOwnProperty('heads')) {
    const extruders = pickExtruders(printer)
    usefulData = {
      extruders,
      materials: pickMaterials(extruders),
      hotends: pickHotends(extruders)
    }
  }
  return usefulData
}
