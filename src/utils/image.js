
export function formatImageData (inputType = 'uint8', outputType = 'base64', data) {
  const inputOutputFormater = {
    'uint8Tobase64': uint8ToBase64,
    'hexTobase64': hexToBase64
  }

  const formatter = inputOutputFormater[`${inputType}To${outputType}`]
  data = formatter ? 'data:image/jpeg;base64,' + formatter(data) : data
  return data
}
// data = URL.createObjectURL(data)
export function uint8ToBase64 (str) {
  return btoa(String.fromCharCode.apply(null, str))
}

function hexToBase64 (str) {
  return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, '').replace(/([\da-fA-F]{2}) ?/g, '0x$1 ').replace(/ +$/, '').split(' ')))
}

function encode (str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode('0x' + p1)
  }))
}

function decode (str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
