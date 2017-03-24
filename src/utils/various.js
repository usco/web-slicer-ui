// "spread" data to a list, by ids value over a list of ids
export function spreadToAll (fieldNames) {
  return function (data) {
    const {ids} = data
    return ids.map(function (id) {
      let result = {}
      fieldNames.forEach(f => { result[f] = data[f] })
      result['id'] = id
      return result
    })
  }
}
