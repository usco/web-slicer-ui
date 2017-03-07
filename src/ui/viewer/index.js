import reglM from 'regl'
import {domEvent, makeStateAndReducers$, makeDefaultReducer, imitateXstream} from '../../utils/cycle'
import { h } from '@cycle/dom'

import controlsStream from './controls/controlsStream'
import limitFlow from '../../utils/most/limitFlow'
import { baseInteractionsFromEvents as interactionsFromEvents, pointerGestures } from 'most-gestures'

import { combine, merge, just, mergeArray, combineArray, from, fromEvent, never } from 'most'
import { params as cameraDefaults } from '@usco/orbit-controls'
import { elementSize } from './elementSizing'

// import drawEnclosure from './rendering/drawEnclosure'
import { formatRawMachineData } from '@usco/printing-utils'

// TODO deal with this correctly
const machinePresets = {
  'ultimaker3_extended': {
    'name': 'ultimaker3_extended',
    'machine_width': 215,
    'machine_depth': 215,
    'machine_height': 300,
    'printable_area': [200, 200]
  },
  'ultimaker3':{
    'name': 'ultimaker3',
    'machine_width': 215,
    'machine_depth': 215,
    'machine_height': 230,
    'printable_area': [200, 200]

  }

}

const initRegl = (canvas) => {
  return reglM({
    canvas,
    extensions: [
      //  'oes_texture_float', // FIXME: for shadows, is it widely supported ?
      // 'EXT_disjoint_timer_query'// for gpu benchmarking only
    ],
    // profile: true,
    attributes: {
      alpha: false
    }
  })
}

function setup (regl, container, defaults, extState$) {
  const render = require('./rendering/render')(regl)

  const baseInteractions = interactionsFromEvents(container)
  const gestures = pointerGestures(baseInteractions)

  const projection$ = elementSize(container)
  const focuses$ = never()
  const entityFocuses$ = never()

  const camState$ = controlsStream({gestures}, {settings: cameraDefaults, camera: defaults.camera}, focuses$, entityFocuses$, projection$)

  let machine = {params: formatRawMachineData(machinePresets['ultimaker3'])}

  const drawEnclosure = require('./rendering/drawEnclosure')(regl, machine.params)

  function makeVisualState (extState$) {
    return combineArray(
      function (camera, entities) {
        const view = camera.view

        machine = {...machine, draw: drawEnclosure}
        // entities.forEach(x => console.log('entity', x))
        return {entities, machine, view, camera, background: defaults.background.color, outOfBoundsColor: defaults.outOfBoundsColor}
      }, [camState$, extState$])
  }

  extState$ = extState$
    .map(function (entities) {
      return entities.entities.map(function (entity) {
        let {visuals} = entity
        if (!visuals.initialized) {
          const draw = visuals.drawFn(regl) // one command per mesh, but is faster
          console.log('draw')
          visuals = {...visuals, draw, initialized: true}
        }
        return {...entity, visuals}
      })
    })
  const visualState$ = makeVisualState(extState$).multicast()

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
  const init = makeDefaultReducer({})
  const {state$, reducer$} = makeStateAndReducers$({}, {init}, sources)

  let regl
  let container
  let extState$ = imitateXstream(state$)
      .map(state => state.buildplate)
      .skipRepeats()
  const view = () => {
    return h('canvas', {
      props: {width: 540 * 2, height: 400 * 2},
      hook: {insert: vnode => { regl = initRegl(vnode.elm); container = vnode.elm; setup(regl, container, defaults, extState$) }}
    })
  }

    // .forEach(x=>console.log('state passed to viewer',x))
  /*
  */

  return {
    DOM: state$.take(1).map(view),
    onion: reducer$
  }
}
