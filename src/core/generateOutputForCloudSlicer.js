export function generateCloudSlicerOptions(state, modelFile, ){

  return {
    slicing_quality:state.qualityPreset,
    slicing_adhesion:state.brim.toggled,
    slicing_support_extruder:0,
    machine_type: state.machineType,
    material_guid: ,
    model_file: modelFile,
    mesh_translations: true,

    mesh_rotation_matrix:[[1,0,0],[0,1,0],[0,0,1]],
    mesh_position_x:0,
    mesh_position_y:0,
    mesh_position_z:0
  }

}
