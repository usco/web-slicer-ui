import reglM from 'regl'
import {domEvent, fromMost, makeStateAndReducers$, makeDefaultReducer, toMost} from '../../utils/cycle'
import { h } from '@cycle/dom'
import xs from 'xstream'

import controlsStream from './controls/controlsStream'
import limitFlow from '../../utils/most/limitFlow'
import { baseInteractionsFromEvents as interactionsFromEvents, pointerGestures } from 'most-gestures'

import { combine, merge, just, mergeArray, combineArray, from, fromEvent, never } from 'most'
import { params as cameraDefaults } from '@usco/orbit-controls'
import { elementSize } from './elementSizing'

const initRegl = (canvas) => {
  return reglM({
    canvas,
    extensions: [
      //  'oes_texture_float', // FIXME: for shadows, is it widely supported ?
      // 'EXT_disjoint_timer_query'// for gpu benchmarking only
    ],
    profile: true,
    attributes: {
      alpha: false
    }
  })
}

/* function prepareRender (regl) {
  const draw = regl({
    frag: `
  precision mediump float;
  uniform vec4 color;
  void main() {
    gl_FragColor = color;
  }`,

    vert: `
  precision mediump float;
  attribute vec2 position;
  uniform float angle;
  uniform vec2 offset;
  void main() {
    gl_Position = vec4(
      cos(angle) * position.x + sin(angle) * position.y + offset.x,
      -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
  }`,

    attributes: {
      position: [
        0.5, 0,
        0, 0.5,
        1, 1]
    },

    uniforms: {
  // the batchId parameter gives the index of the command
      color: regl.prop('color'),
      angle: ({tick}) => 0.01 * tick,
      offset: regl.prop('offset')
    },

    depth: {
      enable: false
    },

    count: 3
  })
  return draw
} */

function setup (regl, container, defaults) {
  const render = require('./rendering/render')(regl)

  const baseInteractions = interactionsFromEvents(container)
  const gestures = pointerGestures(baseInteractions)

  const projection$ = elementSize(container)
  const focuses$ = never()
  const entityFocuses$ = never()

  const camState$ = controlsStream({gestures}, {settings: cameraDefaults, camera: defaults.camera}, focuses$, entityFocuses$, projection$)

  function makeVisualState () {
    const outOfBoundsColor = [0.55, 0.55, 0.55, 0.8]
    const background = [0.96, 0.96, 0.96, 0.3]
    return combineArray(
      function (camera) {
        const view = camera.view

        return {entities: [], machine: undefined, view, camera, background, outOfBoundsColor}
      }, [camState$])
  }

  const visualState$ = makeVisualState()

  visualState$
    .thru(limitFlow(33))
    .tap(x => regl.poll())
    .tap(render)
    .flatMapError(function (error) {
      console.error('error in render', error)
      return just(null)
    })
    .forEach(x => x)
}

export default function GLComponent (sources) {
  const defaults = {
    color: [1, 0, 0, 1],
    v1: 0,
    camera: {
      position: [150, 250, 200],
      target: [0, 0, 0],
      fov: Math.PI / 4,
      aspect: 1,

      projection: new Float32Array(16),
      view: new Float32Array(16),
      near: 1,
      far: 1300,
      up: [0, 0, 1],

      thetaDelta: 0,
      phiDelta: 0,
      scale: 1
    },
    outOfBoundsColor: [0.55, 0.55, 0.55, 0.8],
    background: {
      color: [0.96, 0.96, 0.96, 0.3]
    }
  }
  const init = makeDefaultReducer(defaults)
  let regl
  let render
  let container
  const view = () => h('canvas', {
    props: {width: 1000, height: 1000},
    hook: {insert: vnode => { regl = initRegl(vnode.elm); container = vnode.elm; setup(regl, container, defaults) }}
  })
  //
  const heartBeatAction$ = xs.periodic(5000)
  const heartBeat = (state, input) => {
    state = { ...state, v1: Math.cos(input * 0.05) }
    return state
  }

  const {state$, reducer$} = makeStateAndReducers$({}, {init, heartBeat}, sources)

  state$.addListener({next:
    function (state) {
      // console.log('state here', state)
      if (regl) {
        if (!render) {

          // render = require('./rendering/render')(regl)
        }
        regl.clear({
          color: state.background.color
        })

        // render({ offset: [-1, -state.v1], color: state.color })
      }
    }
  })

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}
