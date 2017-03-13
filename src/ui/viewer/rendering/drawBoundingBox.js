import mat4 from 'gl-mat4'
import {memoize} from 'ramda'

function drawBoundingBox (regl, params) {
  const {min, max} = params

  const position = [
    ...min,
    max[0], min[1], min[2],
    max[0], max[1], min[2],
    min[0], max[1], min[2],

    min[0], min[1], max[2],
    max[0], min[1], max[2],
    ...max,
    min[0], max[1], max[2]
  ]

  // use this one for clean cube wireframe outline
  const elements = [
    0, 1, 2, 3, 0,
    4, 5, 6, 7, 4,
    5, 1, 2, 6, 7, 3
  ]

  return regl({
    frag: `precision mediump float;

    uniform vec4 color;
    varying vec3 vnormal;
    varying vec3 fragNormal, fragPosition;

    void main() {
      gl_FragColor = color;
    }
`,
    vert: `
  precision mediump float;
  attribute vec3 position;
  uniform mat4 model, view, projection;
  void main() {
    gl_Position = projection * view * vec4(position, 1);
  }`,
    attributes: {
      position
    },
    elements,
    uniforms: {
      model: (context, props) => props.model || mat4.identity([]),
      color: (context, props) => props.color || [1.0, 0.0, 0.0, 1.0]
    },
    primitive: 'line strip',
    lineWidth: Math.min(2, regl.limits.lineWidthDims[1]),

    depth: {
      enable: true,
      mask: false,
      func: 'less',
      range: [0, 1]
    }
  })
}

module.exports = memoize(drawBoundingBox)
