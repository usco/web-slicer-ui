import {pluck} from 'ramda'

export function reduceToAverage (acc, cur) {
  if (!acc) return cur
  return [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]].map(x => x * 0.5)
}

export function averageAndSetByFieldname (fieldName, changed, data) {
  const average = pluck(fieldName)(data)
    .reduce(reduceToAverage, undefined)

  let value = Object.assign([], currentAvg)
  value[changed.idx] = changed.val
  return {value, average}
}

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
