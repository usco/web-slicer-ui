import {merge, fromEvent, never} from 'most'
import {path} from 'ramda'
import {imitateXstream} from '../../../utils/cycle'

export default function intent (sources, params) {
  return {
    selectEntities$: imitateXstream(sources.events).filter(x => x.type === 'picks')
      .map(e => e.data.map(path(['entity', 'meta', 'id'])))
  }
}
