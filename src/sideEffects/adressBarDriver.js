import {of} from 'most'
import create from '@most/create'

export default function addressbarDriver (outgoing$) {
  const url = window.location.href

  function getParam (name, url) {
    if (!url) url = location.href
    name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]')
    var regexS = '[\\?&]' + name + '=([^&#]*)'
    var regex = new RegExp(regexS)
    var results = regex.exec(url)
    return results == null ? null : results[1]
  }

  /* let address$ = fromEvent(addressbar, 'change')
    .map(e => e.target.value)
    .startWith(addressbar.value)

  function get (paramName) {
    return address$
      .map(url => fetchUriParams(url, paramName))
      .filter(exists)
      .filter(a => (a.length > 0))
  } */
  const $url = of(url)

  const get = (paramName) => {
    return create((add, end, error) => {
      const params = getParam(paramName, url)
      add(params)
    })
  }

  return {
    url$,
    get
  }
}
