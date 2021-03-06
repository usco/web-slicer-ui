import { fromEvent } from 'most'

// element resize event stream, throttled by throttle amount (250ms default)
export function elementSize (element, throttle = 25) {
  const pixelRatio = window.devicePixelRatio
  function extractSize (x) {
    x = element
    const width = Math.floor(element.clientWidth * pixelRatio)
    const height = Math.floor(element.clientHeight * pixelRatio)
    const bRect = element.getBoundingClientRect ? element.getBoundingClientRect() : { left: 0, top: 0, bottom: 0, right: 0, width: 0, height: 0 }
    return {width, height, aspect: width / height, bRect}
  }

  return fromEvent('resize', window)// only window fires resize events...
    .throttle(throttle /* ms */)
    .map(extractSize)
    .startWith(extractSize())
}
