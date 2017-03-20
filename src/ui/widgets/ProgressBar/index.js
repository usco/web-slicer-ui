import { div, span } from '@cycle/dom'
require('./style.css')

export default function renderProgressBar (state) {
  const defaults = {
    progress: 0,
    hideOnDone: true,
    color: 'rgb(0, 178, 255)'
  }
  const {progress, hideOnDone, color} = Object.assign({}, defaults, state)

  const element = (hideOnDone && progress === 1)
    ? null
    : div('.progressBar', [span('.fill', { style: { width: `${progress * 100}%`, background: color } })])
  return element
}
