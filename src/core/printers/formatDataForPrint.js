import {combineGeometries} from '../../utils/geometry/combineGeometries'

export function generateCloudSlicerOptions (data, modelFile, materials) {
  return {
    slicing_quality: data.qualityPreset,
    slicing_adhesion: data.brim.toggled,
    slicing_support_extruder: data.supportExtruder, // 1,2, -1
    machine_type: data.machineType,
    material_guid: data.materialGuid,
    model_file: modelFile,
    mesh_translations: true,

    mesh_rotation_matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    mesh_position_x: 0,
    mesh_position_y: 0,
    mesh_position_z: 0
  }
}

/**
* Steps:
* 1: Geometry pre process : take all entities, clone their geometries, apply the transforms of the entity to the geometry
* 2: Geometry combine : use mesh-combine or similar to generate a single output mesh/geometry
* 3* Format settings
* Assumes the following:
* - positions are flat array data (Float32Array)
* - transforms already has a transformation matrix pre computed
**/
export function formatDataForPrint (entities) {
  console.log('formatDataForPrint')
  const serializeSTL = require('serialize-stl')
  const geometry = combineGeometries(entities)
  const result = serializeSTL(geometry.cells, geometry.positions)
  return result
}
