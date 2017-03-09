import {mergeActionsByName} from '../../utils/most/various'

import actionsFromDOM from './actions/fromDom'
import {constant, periodic, of, merge, combineArray, sample} from 'most'
import * as R from 'ramda'
import {imitateXstream} from '../../utils/cycle'

import {printers, claimedPrinters, claimPrinter, unclaimPrinter,
   printerInfos, printerCamera, printerSystem, printerStatus, uploadAndStartPrint, abortPrint} from '../umc-api'
import {formatImageData} from '../../utils/image'

import {formatDataForPrint} from './formatDataForPrint'
import {extrudersHotendsAndMaterials} from './utils'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources)
  ]
  const baseActions = mergeActionsByName(actionsSources)
  const state$ = imitateXstream(sources.onion.state$).skipRepeats()

  const SetPrinters$ = merge(
    baseActions.RefreshPrintersList$,
    of(null)
  )
  .combine((_, state) => ({state}), state$.map(state => state.settings.printersPollRate).skipRepeats())
  .map(function (pollRate) { // refresh printers list every 30 seconds
    return constant(null, periodic(pollRate))
  })
  .switch()
  .flatMap(function (_) {
    const allPrinters$ = printers().map(x => x.response)
      .flatMapError(x => of(undefined))// TODO error handling
      .filter(x => x !== undefined)
      .map(printers => printers.map(printer => ({...printer, claimed: undefined})))
    const claimedPrinters$ = claimedPrinters().map(x => x.response)
      .flatMapError(x => of(undefined))// TODO error handling
      .filter(x => x !== undefined)
      .map(printers => printers.map(printer => ({...printer, claimed: true})))

    return combineArray(function (claimedPrinters, allPrinters) {
      let printers = claimedPrinters
      function addItem (item) {
        const found = R.find(x => x.id === item.id && x.name === item.name)(printers)// R.propEq('id', item.id)
        if (found) {
          if (found.claimed === undefined) {
            found.claimed = false
          }
        } else {
          item.claimed = false
          printers.push(item)
        }
      }
      allPrinters.forEach(addItem)
      return printers
    }, [claimedPrinters$, allPrinters$])
  })

  const SetActivePrinterInfos$ = baseActions.SelectPrinter$
    .flatMap(printerInfos)
    .filter(x => x !== undefined)
    .map(x => x.response)
    .multicast()

  const SetActivePrinterSystem$ = baseActions.SelectPrinter$
    .flatMap(printerSystem)
    .filter(x => x !== undefined)
    .map(x => x.response)
    .multicast()

  /* const printerDataRetrived = combineArray(function(infos, system){

  }, [printersStatus$, ]) */

  const ClaimPrinter$ = baseActions.ClaimPrinter$
    .flatMap(claimPrinter)
    .map(!R.has('error'))

  const UnClaimPrinter$ = baseActions.UnClaimPrinter$
    .flatMap(unclaimPrinter)
    .map(R.has('error'))

  // camera feed
  const cameraPollRate$ = state$.map(state => state.settings.cameraPollRate).skipRepeats()

  const SetCameraImage$ = baseActions.SelectPrinter$
    .delay(3000)
    .combine((id, cameraPollRate) => ({cameraPollRate, id}), cameraPollRate$)
    .map(function ({id, cameraPollRate}) {
      return constant(id, periodic(cameraPollRate))
        .until(baseActions.SelectPrinter$)// get images for the current printer id until we select another
    })
    .switch()
    .flatMap(printerCamera)
    .map(formatImageData.bind(null, 'blob', 'img'))

  // for now uses same polling as camera
  const PollStatus$ = baseActions.SelectPrinter$
    .delay(3000)
    .combine((id, cameraPollRate) => ({cameraPollRate, id}), cameraPollRate$)
    .map(function ({id, cameraPollRate}) {
      return constant(id, periodic(cameraPollRate))
        .until(baseActions.SelectPrinter$)// get images for the current printer id until we select another
    })
    .switch()
    .flatMap(printerStatus)
    .map(x => x.response)
    .map(function (response) {
      if (response.job) {
        if (response.job.state === 'wait_cleanup') {
          return 'waiting for cleanup, please remove the print from the buildplate'
        }
        return `Printing : ${response.job.progress} % Total time : ${response.job.time_total}`
      }
      return response.status

      return {message: response.status, state: 'wait_cleanup'}
    })
    .tap(x => console.log('printer status', x))

  const retry = (n, stream) => stream.recoverWith(e => n === 0 ? most.throwError(e) : retry(n - 1, stream))
  //.thru(retry.bind(null,1))

  const printStarted$ = sample(state => state, baseActions.StartPrint$, state$.skipRepeats())
    .flatMap(function (state) {
      console.log('start print')
      const activePrinterInfos = R.prop('infos', R.find(R.propEq('id', state.activePrinterId), state.printers))
      const {materials} = extrudersHotendsAndMaterials(activePrinterInfos)

      const data = formatDataForPrint(state.buildplate.entities)
      const file = new Blob([data], {type: 'application/sla'})

      const printParams = {
        filename: 'test.stl',
        slicing_quality: 'draft', // draft|fast|normal|high
        slicing_adhesion: false,
        slicing_support_extruder: -1, // -1,1,2
        machine_type: 'ultimaker3',
        material_guid: materials[0],
        mesh_translations: true,

        mesh_rotation_matrix: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
        mesh_position_x: 0,
        mesh_position_y: 0,
        mesh_position_z: 0
      }

      return uploadAndStartPrint(state.activePrinterId, printParams, file)
        .map(response => ({success: true, message: 'print started'}))
        .flatMapError(function (error) {
          return of({success: false, message: error.message})
        })
    })

  const PauseResumePrint$ = baseActions.PauseResumePrint$.scan((state, newValue) => !state, false)

  const printAborted$ = sample(state => state, baseActions.AbortPrint$, state$.skipRepeats())
      .flatMap(state => abortPrint(state.activePrinterId))

  const refinedActions = {
    SetPrinters$,
    SetActivePrinterInfos$,
    SetActivePrinterSystem$,
    SetCameraImage$,
    PollStatus$,
    ClaimPrinter$,
    UnClaimPrinter$,

    PauseResumePrint$,

    printStarted$,
    printAborted$
  }

  return {...baseActions, ...refinedActions}
}

/* most.merge(
  imitateXstream(_domEvent('.RefreshPrintersList', 'click')),
  most.of(null)
)
.combine((_, state) => ({state}), state$.map(state => state. settings).skipRepeats())
.flatMap(function ({state}) { // refresh printers list every 30 seconds
  console.log('state changed', state)
  return most.constant(null, most.periodic(state.printersPollRate))
}).forEach(x=>console.log('combined state stuff',x )) */

// not sure how to deal with this one
/* const modelUri$ = most.merge(
sources.adressBar,
sources.window.modelUri$
)
.flatMapError(function (error) {
  // console.log('error', error)
  modelLoaded(false) // error)
  return just(null)
})
.filter(x => x !== null)
.multicast()
*/
