export function addEntities (state, inputs) {
  console.log('addEntities')
  return {...state, entities: state.entities.concat([inputs])}
}

export function clearEntities (state, inputs) {
  return {...state, entities: []}
}
