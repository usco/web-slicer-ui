import {merge, just, from} from 'most'
import { dragEvents, dragAndDropEffect } from '../sideEffects/dragDropDriver'
import {combineDataSources} from './combineDataSources'
import makeStlStream from 'usco-stl-parser'

import entityPrep from '../core/entities/entityPrep'

export function dataSources (sources) {
  console.log(sources)
  const modelUri$ = merge(
    sources.addressBar.get('modelUrl'),
    sources.window.modelUri$
  )
    .flatMapError(function (error) {
      // FIXME: dispatch errors
      return just(null)
    })
    .filter(x => x !== null)
    .multicast()

  const draggedItems$ = dragAndDropEffect(dragEvents(document))
    .flatMap(function (droppedData) {
      console.log('droppedData', droppedData)
      /* if (droppedData.type === 'file') {
        droppedData.data.forEach(function (file) {})
      } */
      return from(droppedData.data) // droppedData.data.map(just))
    })
    .multicast()

  const parsers = {
    'stl': makeStlStream
    //'3mf': make3mfStream
  }

  const parsedModelData$ = combineDataSources(parsers, modelUri$, draggedItems$)
      .flatMapError(function (error) {
        // FIXME: dispatch errors
        console.error(`failed to load geometry ${error}`)
        return just(undefined)
      })
      .filter(x => x !== undefined)
      .multicast()



  return parsedModelData$
    .thru(entityPrep)
}
