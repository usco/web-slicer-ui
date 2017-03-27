import {merge, fromEvent, never} from 'most'
import {path} from 'ramda'
import {imitateXstream} from '../../../utils/cycle'

export default function intent (sources, params) {
  return {
    selectEntities$: imitateXstream(sources.events)
      .filter(x => x.type === 'picks')
      .map(e => e.data.map(path(['entity', 'meta', 'id']))),

    changeBounds$: imitateXstream(sources.events)
      .filter(x => x.type === 'changeBounds')
      .map(x => x.data),

    changeTransforms$: imitateXstream(sources.events)
      .filter(x => x.type === 'changeTransforms')
      .map(x => x.data),

    resetScaling$: imitateXstream(sources.events)
      .filter(x => x.type === 'resetScaling')
      .map(x => x.data),

    mirror$: imitateXstream(sources.events)
      .filter(x => x.type === 'mirror')
      .map(x => x.data)
  }
}
