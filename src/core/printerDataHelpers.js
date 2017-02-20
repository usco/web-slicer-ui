import * as R from 'ramda'

export const pickExtruders = printerInfos => R.prop('extruders', R.head(R.prop('heads', printerInfos)))
export const pickMaterials = extruders => R.map(R.path(['active_material', 'guid']), extruders)
export const pickHotends = extruders => R.map(R.path(['hotend', 'id']), extruders)
