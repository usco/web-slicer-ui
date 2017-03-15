import mat4 from 'gl-mat4'
import { update, rotate, zoom, setFocus } from '@usco/orbit-controls'
import { computeCameraToFitBounds, cameraOffsetToEntityBoundsCenter } from '@usco/camera-utils'

import { model } from '../modelUtils'
import {rafStream} from '../../../utils/most/animationFrames'
import limitFlow from '../../../utils/most/limitFlow'

export default function controlsStream (interactions, cameraData, focuses$, entityFocuses$, projection$) {
  let {settings, camera} = cameraData
  const {gestures} = interactions
  const rate$ = rafStream() // heartBeat

  const drags$ = gestures.drags
    .filter(x => x !== undefined)
    .map(data => [-Math.PI * data.delta.x, -Math.PI * data.delta.y])
    .map(x => x.map(y => y * 0.1)) // empirical reduction factor

  const zooms$ = gestures.zooms
    .map(x => -x) // we invert zoom direction
    .startWith(0)
    .filter(x => !isNaN(x))
    .map(x => x * 2.5)

  // model/ state/ reducers
  function makeCameraModel () {
    function setProjection (state, input) {
      const projection = mat4.perspective([], state.fov, input.width / input.height, // context.viewportWidth / context.viewportHeight,
        state.near,
        state.far)
      state.projection = projection
      state.aspect = input.width / input.height
      //state = Object.assign({}, state, update(settings, state)) // not sure
      return state
    }

    function applyRotation (state, angles) {
      state = rotate(settings, state, angles) // mutating, meh
      return state
    }

    function applyZoom (state, zooms) {
      state = zoom(settings, state, zooms)//, {adjustPlanes: true}) // mutating, meh
      return state
    }

    function applyFocusOn (state, focuses) {
      state = setFocus(settings, state, focuses) // mutating, meh
      return state
    }

    function zoomToFit (state, input) {
      //console.log('zoomToFit', state.position, state.target,  input)
      let camera = state

      const {bounds, transforms} = input
      const offsetTargetAndPosition = cameraOffsetToEntityBoundsCenter({camera, bounds, transforms, axis: 2})
      camera = Object.assign({}, state, offsetTargetAndPosition)
      const phase2 = computeCameraToFitBounds({camera, bounds, transforms})
      state.targetTgt = phase2.target
      state.positionTgt = phase2.position
      return state
      //FIXME: just a test for zoomToFit for now
      //console.log('zoomToFit', state.position, state.target,  input)
      /*camera.near = 0.01
      settings.limits.minDistance = 0
      let camera = state
      const {bounds, transforms} = input
      camera = Object.assign({}, state, cameraOffsetToEntityBoundsCenter({camera, bounds, transforms, axis: 2}))
      camera = Object.assign({}, state, computeCameraToFitBounds({camera, bounds, transforms}))
      return camera*/
    }

    //this is used for 'continuous updates' for things like spin effects, autoRotate etc
    function updateState (state) {
      return Object.assign({}, state, update(settings, state))
    }

    const updateFunctions = {
      setProjection,
      applyZoom,
      applyRotation,
      //applyFocusOn,
      zoomToFit,
      updateState
    }
    const actions = {
      setProjection: projection$,
      applyZoom: zooms$,
      applyRotation: drags$,
      //applyFocusOn: focuses$,
      zoomToFit: entityFocuses$,
      updateState: rate$
    }

    const cameraState$ = model(camera, actions, updateFunctions)

    return cameraState$
  }

  const cameraState$ = makeCameraModel()

  return cameraState$
    .thru(limitFlow(33))
}
