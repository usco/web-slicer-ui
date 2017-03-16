import {button, i, div} from '@cycle/dom'

export default function icon (svg) {
  return div([i({props: {innerHTML: svg}})])
}
