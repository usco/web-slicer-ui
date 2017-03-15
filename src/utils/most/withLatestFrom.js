import {sample} from 'most'

export default function withLatestFrom (fn, sampleStream$, otherStreams) {
  return sample(function (sampleStream, ...otherStreams) {
    return fn(...[sampleStream, ...otherStreams])
  }, sampleStream$, sampleStream$, ...otherStreams)
}
