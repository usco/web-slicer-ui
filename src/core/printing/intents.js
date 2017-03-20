import {mergeActionsByName} from '../../utils/most/various'

import actionsFromDOM from './actions/fromDom'
import {constant, periodic, of, merge, combineArray, sample} from 'most'
import {pathOr, has, find, prop, propEq} from 'ramda'
import {imitateXstream} from '../../utils/cycle'

import {printers, claimedPrinters, claimPrinter, unclaimPrinter, printerName,
   printerInfos, printerCamera, printerSystem, printerStatus, uploadAndStartPrint, abortPrint} from '../umc-api'
import {formatImageData} from '../../utils/image'

import {formatDataForPrint} from './formatDataForPrint'
import {extrudersHotendsAndMaterials} from './utils'
import {formatNumberTo} from '../../utils/formatters'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources)
  ]
  const baseActions = mergeActionsByName(actionsSources)
  const state$ = imitateXstream(sources.onion.state$).skipRepeats()

  // helper function to fetch the 'friendly names' of the claimed printers
  function friendlyNames (printers)
  {
    function getName (printer) {
      return printerName(printer.id)
        .map(r => r.response)
        .flatMapError(error => of(undefined))
    }
    return combineArray(function (...names) {
      return printers.map((p, i) => ({...p, friendlyName: names[i]}))
    }, printers.map(getName))
  }

  const SetPrinters$ = merge(
    baseActions.RefreshPrintersList$,
    state$.map(state => state.printing.settings.printersPollRate).skipRepeats()
    .map(function (pollRate) { // refresh printers list every pollRate seconds
      return constant(null, periodic(pollRate))
    })
    .switch()
  )
  .flatMap(function (_) {
    const allPrinters$ = printers().map(x => x.response)
      .flatMapError(x => of(undefined))// TODO error handling
      .filter(x => x !== undefined)
      .map(printers => printers.map(printer => ({...printer, claimed: undefined, friendlyName: undefined})))

    const claimedPrinters$ = claimedPrinters().map(x => x.response)
      .flatMapError(x => of(undefined))// TODO error handling
      .filter(x => x !== undefined)
      .map(printers => printers.map(printer => ({...printer, claimed: true, friendlyName: undefined})))
      .flatMap(friendlyNames)

    return combineArray(function (claimedPrinters, allPrinters) {
      let printers = claimedPrinters
      function addItem (item) {
        const found = find(x => x.id === item.id && x.name === item.name)(printers)// propEq('id', item.id)
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
  .tap(x => console.log('refreshing printers list'))

  const SetActivePrinterSystem$ = baseActions.SelectPrinter$
    .flatMap(printerSystem)
    .filter(x => x !== undefined)
    .map(x => x.response)
    .multicast()

  const ClaimPrinter$ = baseActions.ClaimPrinter$
    .flatMap(claimPrinter)
    .map(!has('error'))

  const UnClaimPrinter$ = baseActions.UnClaimPrinter$
    .flatMap(unclaimPrinter)
    .map(has('error'))

  // camera feed
  const cameraPollRate$ = state$.map(state => state.printing.settings.cameraPollRate).skipRepeats()

  const SetActivePrinterInfos$ = baseActions.SelectPrinter$
    .combine((id, cameraPollRate) => ({cameraPollRate, id}), cameraPollRate$)
    .map(function ({id, cameraPollRate}) {
      return constant(id, periodic(cameraPollRate))
        .until(baseActions.SelectPrinter$)// get images for the current printer id until we select another
    })
    .switch()
    .flatMap(function (id) {
      return printerInfos(id)
        .flatMapError(err => of(undefined))
        .filter(x => x !== undefined)
    })
    .map(x => x.response)
    .multicast()

  const SetCameraFrame$ = baseActions.SelectPrinter$
    .delay(1000)
    .combine((id, cameraPollRate) => ({cameraPollRate, id}), cameraPollRate$)
    .map(function ({id, cameraPollRate}) {
      return constant(id, periodic(cameraPollRate))
        .until(baseActions.SelectPrinter$)// get images for the current printer id until we select another
    })
    .switch()
    .flatMap(function (id) {
      return printerCamera(id)
        .flatMapError(error => of(undefined))
        .filter(x => x !== undefined)
    })
    .map(formatImageData.bind(null, 'blob', 'img'))

  // for now uses same polling as camera
  const SetPrinterStatus$ = baseActions.SelectPrinter$
    .delay(1000)
    .combine((id, cameraPollRate) => ({cameraPollRate, id}), cameraPollRate$)
    .map(function ({id, cameraPollRate}) {
      return constant(id, periodic(cameraPollRate))
        .until(baseActions.SelectPrinter$)// get images for the current printer id until we select another
    })
    .switch()
    .flatMap(function (id) {
      return printerStatus(id)
        .flatMapError(error => of(undefined))
        .filter(x => x !== undefined)
    })
    .map(x => x.response)
    .map(function (response) {
      const state = pathOr(response.status, ['job', 'state'])(response)
      const job = pathOr({}, ['job'])(response)
      const progress = pathOr(0, ['job', 'progress'])(response)
      const totalTime = pathOr(0, ['job', 'time_total'])(response)
      const progressPercent = formatNumberTo(progress * 100, 2)

      const messages = {
        undefined: response.status,
        'idle': `printer available & ready!`,
        'wait_cleanup': `waiting for cleanup, please remove the print from the buildplate`,
        'pre_print': 'preparing print',
        'printing': 'printing'//`Printing : ${progressPercent} % Total time : ${totalTime}`
      }

      let busy = true
      if (state === 'idle') {
        busy = false
      }
      const message = messages[state]
      return {message, state, job, busy}
    })

  const printStarted$ = sample(state => state, baseActions.StartPrint$, state$.skipRepeats())
    .flatMap(function (state) {
      console.log('start print')
      const activePrinterInfos = prop('infos', find(propEq('id', state.printing.activePrinterId), state.printing.printers))
      const {materials} = extrudersHotendsAndMaterials(activePrinterInfos)

      const data = formatDataForPrint(state.buildplate.entities)
      const file = new Blob([data], {type: 'application/sla'})

      function download (name) {
        var a = document.getElementById('a')
        a.href = URL.createObjectURL(file)
        a.download = name
        a.click()
      }
      console.log('data for print', data, file)
      download('foo.stl')

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

      return uploadAndStartPrint(state.printing.activePrinterId, printParams, file)
        .map(response => ({success: true, message: 'print started'}))
        .flatMapError(function (error) {
          return of({success: false, message: error.message})
        })
      // return of({success: true, message: 'fake'})
    })

  const PauseResumePrint$ = baseActions.PauseResumePrint$.scan((state, newValue) => !state, false)

  const printAborted$ = sample(state => state, baseActions.AbortPrint$, state$.skipRepeats())
      .flatMap(state => abortPrint(state.printing.activePrinterId))

  const refinedActions = {
    SetPrinters$,
    SetActivePrinterInfos$,
    SetActivePrinterSystem$,
    SetCameraFrame$,
    SetPrinterStatus$,
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
  return most.constant(null, most.periodic(state.printing.printersPollRate))
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
