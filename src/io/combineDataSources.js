import xhrAsStream from '../io/xhrloader'
import fileAsStream from '../io/fileLoader'

import { getExtension } from '../utils/file'
import { just, mergeArray, from } from 'most'

/**
 * combine different sources of data and output the parsed results in an observable
 * @param {Object} parsers the hash of parsers to use in the form :
 * {  'stl': makeStlStream,
 *   '3mf': make3mfStream}
 * @param {modelUri$} observable of model uris
 * @param {modelFiles$} observable of model ...files (as in html5 File object)
 * @returns {observable} an observable with pre formated data
 */
export function combineDataSources (parsers, modelUri$, modelFiles$) {
  console.log('parsers', parsers)
  const parserParams = {useWorker: true}
  // carefull ! stream parser function is NOT reuseable ! cannot bind() etc
  const pickParser = (data) => parsers[data.ext]

  modelUri$ = modelUri$
    .map(x => ({type: 'uri', data: x, ext: getExtension(x)}))
    .flatMap(function (data) {
      const parser = pickParser(data)
      return xhrAsStream(parser(parserParams), data.data)
    })

  modelFiles$ = modelFiles$
    .map(x => ({type: 'file', data: x, ext: getExtension(x.name)}))
    .flatMap(function (data) {
      const parser = pickParser(data)
      return fileAsStream(parser(parserParams), data.data)
    })

  return mergeArray([modelUri$, modelFiles$])
    .flatMap(function (modelData) {
      if (!modelData.hasOwnProperty('_finished')) {
        // for stl & co
        const data = {
          transforms: {pos: [0, 0, 0.5], rot: [0, 0, Math.PI], sca: [1, 1, 1], parent: undefined}, // [0.2, 1.125, 1.125]},
          geometry: modelData,
          visuals: {
            type: 'mesh',
            visible: true,
            color: [0.02, 0.7, 1, 1] // 07a9ff [1, 1, 0, 0.5],
          },
          meta: {
            id: 0,
            origin: ''
          }}

        return just(data)
      }

      // let data = assembleStuff3(modelData).entities
      console.log('done loading', data)
      return from(data)
    })
}
