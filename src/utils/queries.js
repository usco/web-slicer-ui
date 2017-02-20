const path = require('path')
import {of} from 'most'
import create from '@most/create'

const fakePrinterInfos = require('../../assets/fakePrinterInfos.json') //require(path.resolve(__dirname, '../../assets/fakePrinterInfos.json'))
export const printerInfos = function (id) {
  return of(fakePrinterInfos)
}
