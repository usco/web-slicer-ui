// from https://projects.lukehaas.me/css-loaders/

import { div } from '@cycle/dom'
require('./elipsis.css')

export default function renderElipsisSpinner (state) {
  const defaults = {}
  const {} = Object.assign({}, defaults, state)

  const element = div('.loader')
  return element
}
