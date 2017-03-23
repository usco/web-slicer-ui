import makeWrapperScope from '@usco/render-utils/dist/wrapperScope'

import { computeTMatrixFromTransforms as model } from '@usco/transform-utils'
import { drawGrid as prepareDrawGrid } from '@usco/render-utils'

import mat4 from 'gl-mat4'
import drawBoundingBox from './drawBoundingBox'

module.exports = function render (regl, params) {
  const defaults = {
    drawBounds: false
  }
  const {drawBounds} = {...defaults, ...params}

  const wrapperScope = makeWrapperScope(regl)

  // infine grid, always there
  // infinite grid
  const gridSize = [1220, 1200] // size of 'infinite grid'
  const drawInfiniGrid = prepareDrawGrid(regl, {size: gridSize, ticks: 10, infinite: true})
  const infiniGridOffset = model({pos: [0, 0, -1.8]})

  let command = (props) => {
    const {entities, machine, camera, view, settings} = props

    wrapperScope(props, (context) => {
      regl.clear({
        color: settings.background.color,
        depth: 1
      })
      // fogColor is dominant
      // drawInfiniGrid({view, camera, color: [0, 0, 0, 0], fogColor: settings.background.color, model: infiniGridOffset})

      const outOfBoundsEntities = entities
        .filter(entity => entity.bounds.outOfBounds)

      if (machine) {
        machine.draw({view, camera, outOfBoundsEntities: outOfBoundsEntities.length > 0})
      }

      entities
        .filter(entity => entity.hasOwnProperty('geometry'))
        .map(function (entity) {
          // use this for colors that change outside build area
          // const color = entity.visuals.color
          // const printableArea = machine ? machine.params.printable_area : [0, 0]
          // this one for single color for outside bounds
          let color = entity.bounds.outOfBounds ? settings.outOfBoundsColor : entity.visuals.color
          if (entity.meta.selected) {
            color = settings.selectionColor
          }
          const printableArea = undefined

          entity.visuals.draw({view, camera, color, model: entity.transforms.matrix, printableArea})

          // helper to display the boundingBox
          if (drawBounds) {
            drawBoundingBox(regl, entity.bounds)({view, camera, model: mat4.identity([])})
          }
        })

    /* entities.map(function (entity) {
      const {pos} = entity.transforms
      const offset = pos[2]-entity.bounds.size[2]*0.5
      const model = _model({pos: [pos[0], pos[1], -0.1]})
      const headSize = [100,60]
      const width = entity.bounds.size[0]+headSize[0]
      const length = entity.bounds.size[1]+headSize[1]

      return makeDrawPrintheadShadow(regl, {width,length})({view, camera, model, color: [0.1, 0.1, 0.1, 0.15]})
    }) */
    })
  }

  return function render (data) {
    command(data)
    // boilerplate etc
  // for stats, resizing etc
  // regl.poll()
  }
}
