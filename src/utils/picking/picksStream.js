import mat4 from 'gl-mat4'
import pick from 'camera-picking-ray'

import intersect from './intersect'
import {sample} from 'most'

function withLatestFrom (fn, sampleStream$, otherStreams) {
  return sample(function (sampleStream, ...otherStreams) {
    return fn(...[sampleStream, ...otherStreams])
  }, sampleStream$, sampleStream$, ...otherStreams)
}

export default function picksStream (taps$, viewport$, camera$, entities$) {
  return withLatestFrom(function (taps, viewport, camera, entities) {
    return pickAttempt({position: [taps.clientX-viewport.bRect.left, taps.clientY-viewport.bRect.top]}, [viewport.bRect.left, viewport.bRect.top, viewport.bRect.width, viewport.bRect.height], camera, entities)
  }, taps$, [viewport$, camera$, entities$])
}

function pickAttempt (pointer, viewport, camera, entities) {
  //viewport = [ 0, 0, viewport[2], viewport[3] ]
  pointer.position[1] = viewport[3] - pointer.position[1]
  //console.log(pointer.position, viewport)

  // warning !!! posible issues with camera-unproject , itself used in other modules https://github.com/Jam3/camera-unproject/issues/1
  const {projection, view} = camera
  const projView = mat4.multiply([], projection, view)
  const invProjView = mat4.invert([], projView)

  let ray = { // this data will get mutated to contain data
    ro: [0, 0, 0],
    rd: [0, 0, 0]
  }
  // store result in ray (origin, direction)
  pick(ray.ro, ray.rd, pointer.position, viewport, invProjView)

  return entities
    .filter(e => e.meta.pickable)
    .map(function (entity, index) {
      return intersect(ray, entity, index)
    })
    .filter(h => h !== null)
    .concat([])
}
