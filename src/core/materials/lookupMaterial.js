const _materials = require('../../../assets/materials.json')
import create from '@most/create'

/**
 * exports materials as an observable , this way if we need to load it async, api won't change
 * @return {Object}   the list of materials
 */
export function getMaterials () {
  return create((add, end, error) => {
    add(_materials.materials)
  })
}

export const materials = _materials.materials
