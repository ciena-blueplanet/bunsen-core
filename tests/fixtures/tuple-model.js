module.exports = {
  type: 'object',
  properties: {
    foo: {
      type: 'array',
      items: [{
        type: 'object',
        properties: {
          bar: {
            type: 'string'
          }
        }
      }, {
        type: 'number'
      }],
      additionalItems: {
        type: 'object',
        properties: {
          baz: {
            type: 'string'
          }
        }
      }
    }
  }
}
