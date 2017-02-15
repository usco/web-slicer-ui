const fs = require('fs')
const path = require('path')
const {parseString} = require('xml2js')

const input = fs.readFileSync(path.join(__dirname, 'strings.xml'))
parseString(input, function (undefined, result) {
  let output = {}
  result.resources.string.forEach(item => {
    output[item.$.name] = item._.replace(/\\/g, '')
  })
  fs.writeFileSync(path.join(__dirname, 'strings_en.json'), JSON.stringify(output))
})
