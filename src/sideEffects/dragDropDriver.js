import { mergeArray, fromEvent } from 'most'
//import { preventDefault, isTextNotEmpty, exists } from '../utils/obsUtils'

function formatData (data, type) {
  return {data, type}
}

export function preventDefault (event) {
  event.preventDefault()
  return event
}

export function isTextNotEmpty
 (text) {
  return text !== ''
}

export function exists (input) {
  return input !== null && input !== undefined
}

// onst dragOvers$ = DOM.select(':root').events('dragover')
// const drops$ = DOM.select(':root').events('drop')
export function dragEvents (targetEl) {
  const dragOvers$ = fromEvent('dragover', targetEl)
  const drops$ = fromEvent('drop', targetEl)

  return {dragOvers$, drops$}
}

export function dragAndDropEffect ({dragOvers$, drops$}) {
  drops$.multicast()
  drops$.forEach(preventDefault)
  dragOvers$.forEach(preventDefault)

  let urls$ = drops$
    .map(event => event.dataTransfer.getData('url'))
    .filter(isTextNotEmpty)
    .map(data => formatData([data], 'url'))

  let texts$ = drops$
    .map(event => event.dataTransfer.getData('Text'))
    .filter(isTextNotEmpty)
    .map(data => formatData([data], 'text'))

  let files$ = drops$
    .map(event => event.dataTransfer.files)
    .filter(exists)
    .map(data => [].slice.call(data))
    .map(data => formatData(data, 'file'))

  return mergeArray([urls$, texts$, files$])
}
