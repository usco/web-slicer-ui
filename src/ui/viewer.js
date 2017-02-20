import reglm from 'regl'
import {domEvent, fromMost, makeStateAndReducers$, makeDefaultReducer, toMost} from '../utils/cycle'
import { h } from '@cycle/dom'

export default function GLComponent (sources) {
  const init = makeDefaultReducer({
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
  })
  const view = state => h('canvas', {hook: {insert: vnode => { regl = reglm({canvas: vnode.elm}) }}})

  let regl
  let render

  function prepareRender (regl) {
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
  }

  const {state$, reducer$} = makeStateAndReducers$({}, {init}, sources)

  state$.addListener({next:
    function (state) {
      if (regl) {
        if (!render) {
          render = prepareRender(regl)
        }
        regl.clear({
          color: state.background.color
        })
        render({ offset: [-1, -state.v1], color: state.color })
      }
    }
  })

  /*visualState$
    .thru(limitFlow(33))
    .tap(x => regl.poll())
    .tap(render)
    .flatMapError(function (error) {
      console.error('error in render', error)
      return just(null)
    })
    .forEach(x => x)*/

  return {
    DOM: state$.map(view),
    onion: reducer$
  }
}
