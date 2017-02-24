const {create} = require('@most/create')
const request = require('request')
const {fromPromise, of} = require('most')

module.exports = function makeRequest (uri, options) {
  const optionsDefaults = {
    parse: true,
    json: true,
    timeout: 9999999
  }
  options = Object.assign({}, optionsDefaults, options)

  return fromPromise(fetch(uri, options))
    .flatMap(function (response) {
      if (options.parse || options.json) {
        return fromPromise(response.json())
      }
      else{
        return fromPromise(response.blob())
      }
      return of(response)
    })
    .tap(x => console.log('response', x))
}

/* module.exports = function makeRequest (uri, options) {
  const optionsDefaults = {
    parse: true,
    json: true,
    timeout: 9999999
  }
  options = Object.assign({}, optionsDefaults, options)

  //console.log(`making request to ${uri}`)
  return create((add, end, error) => {
    request(Object.assign({uri}, options), function (err, response, body) {
      console.log(`recieved answer for ${uri}`)
      // console.log('err', err, body) // , 'response', response, 'body', body)
      // console.log(response.statusCode)
      if (!err && response.statusCode === 200) {
        try {
          //console.log(body)
          add(body)
        } catch(err) {
          //console.log('error here')
          error(err)
        }
      } else {
        //console.log('error', err)//, response.statusCode, uri)
        if (!err) {
          if(body){
            err = body
          }
        }
        // console.log("error in request",err)
        error(err)
      }
    })
  })
} */
