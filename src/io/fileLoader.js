import {create} from '@most/create'
import fileReaderStream from 'filereader-stream'

export default function fileAsStream (parser, data) {
  console.log('data in fileAsStream', data) // , parser)
  return create((add, end, error) => {
    const streamErrorHandler = (err) => error(err)

    fileReaderStream(data)
      .on('error', streamErrorHandler)
      .pipe(parser)
      .on('data', function (data) {
        //console.log('data', data)
        add(data)
        end()
      })
  // .pipe(concatStream(data => add(data)))
  })
}
