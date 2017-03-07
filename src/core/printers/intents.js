import {mergeActionsByName} from '../../utils/most/various'

import actionsFromDOM from './actions/fromDom'
import * as most from 'most'
import * as R from 'ramda'
import {domEvent, fromMost, toMost, makeStateAndReducers$, makeDefaultReducer, mergeReducers, imitateXstream} from '../../utils/cycle'

import {printers, claimedPrinters, claimPrinter, unclaimPrinter,
   printerInfos, printerCamera, printerSystem, uploadAndStartPrint, abortPrint} from '../umc'
import {formatImageData} from '../../utils/image'

import {formatDataForPrint} from '../formatDataForPrint'
import {extrudersHotendsAndMaterials} from './utils'

export default function intents (sources) {
  const actionsSources = [
    actionsFromDOM(sources)
  ]
  const baseActions = mergeActionsByName(actionsSources)

  const SetPrinters$ = most.merge(
    baseActions.RefreshPrintersList$,
    most.of(null)
  )
  .combine((_, state) => ({state}), imitateXstream(sources.onion.state$).map(state => state.settings.printersPollRate).skipRepeats())
  .map(function (pollRate) { // refresh printers list every 30 seconds
    return most.constant(null, most.periodic(pollRate))
  })
  .switch()
  .flatMap(function (_) {
    const allPrinters$ = printers().map(x => x.response)
      .flatMapError(x => most.of(undefined))// TODO error handling
      .filter(x => x !== undefined)
      .map(printers => printers.map(printer => ({...printer, claimed: undefined})))
    const claimedPrinters$ = claimedPrinters().map(x => x.response)
      .flatMapError(x => most.of(undefined))// TODO error handling
      .filter(x => x !== undefined)
      .map(printers => printers.map(printer => ({...printer, claimed: true})))

    return most.combineArray(function (claimedPrinters, allPrinters) {
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

  const ClaimPrinter$ = baseActions.ClaimPrinter$
    .flatMap(claimPrinter)
    .map(!R.has('error'))

  const UnClaimPrinter$ = baseActions.UnClaimPrinter$
    .flatMap(unclaimPrinter)
    .map(R.has('error'))

  const SetCameraImage$ = baseActions.SelectPrinter$
    .combine((id, state) => ({state, id}), imitateXstream(sources.onion.state$))
    .flatMap(function ({id, state}) {
      return most.constant(id, most.periodic(state.settings.cameraPollRate))
        .until(baseActions.SelectPrinter$)// get images for the current printer id until we select another
    })
    .flatMap(printerCamera)
    .map(formatImageData.bind(null, 'blob', 'img'))

  const StartPrint$ = baseActions.StartPrint$
    .combine((_, state) => state, imitateXstream(sources.onion.state$)
    // imitateXstream(sources.onion.state$)
    // .map(state => ({entities: state.entities, activePrinterId: state.activePrinterId}))
    ).skipRepeats()
    .take(1)
    .flatMap(function (state) {
      console.log('state', state)

      const activePrinterInfos = R.prop('infos', R.find(R.propEq('id', state.activePrinterId), state.printers))
      const {materials} = extrudersHotendsAndMaterials(activePrinterInfos)

      const data = formatDataForPrint(state.entities)
      const file = new Blob([data], {type: 'application/sla'})
      console.log('material_guid', materials[0])
      return uploadAndStartPrint(state.activePrinterId, {material_guid: materials[0]}, file)
    })
    .forEach(x => console.log('print???', x))

  const AbortPrint$ = baseActions.AbortPrint$
      .combine((_, state) => state, imitateXstream(sources.onion.state$))
      .map(function (state) {
        abortPrint(state.activePrinterId)
      })
      .forEach(x => x)

  const refinedActions = {
    SetPrinters$,
    SetActivePrinterInfos$,
    SetActivePrinterSystem$,
    SetCameraImage$,
    ClaimPrinter$,
    UnClaimPrinter$,
    //StartPrint$,
    //AbortPrint$
  }

  return {...baseActions, ...refinedActions}
}


/* most.merge(
  imitateXstream(_domEvent('.RefreshPrintersList', 'click')),
  most.of(null)
)
.combine((_, state) => ({state}), imitateXstream(sources.onion.state$).map(state => state. settings).skipRepeats())
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
.multicast() */
