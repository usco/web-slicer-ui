import * as R from 'ramda'

export const pickExtruders = printerInfos => R.prop('extruders', R.head(R.prop('heads', printerInfos)))
export const pickMaterials = extruders => R.map(R.path(['active_material', 'guid']), extruders)
export const pickHotends = extruders => R.map(R.path(['hotend', 'id']), extruders)

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
