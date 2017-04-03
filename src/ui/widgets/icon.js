import {button, i, div} from '@cycle/dom'

export default function icon (svg) {
  return div('.icon', [i({props: {innerHTML: svg}})])
}
