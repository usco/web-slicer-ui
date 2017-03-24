import {pluck, filter, compose, mapAccum, isNil, not, apply, addIndex} from 'ramda'

const isNotNil = x => not(isNil(x))

export const averageWithDefault = (attr, defaults) => compose(
  apply((values, acc) => values.map(val => val / (acc.length || 1))),
  addIndex(mapAccum)(function (acc, cur, idx) { // add every percentage at same index together
    const val = idx === 0 ? cur : [acc[0] + cur[0], acc[1] + cur[1], acc[2] + cur[2]]
    return [val, idx]
  }, defaults),
  filter(isNotNil),
  pluck(attr)
)
