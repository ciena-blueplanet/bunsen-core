module.exports = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['type1', 'type2']
    },
    foo: {
      type: 'array',
      items: [{
        type: 'string'
      }, {
        type: 'number',
        conditions: [{
          if: [{
            kind: {equals: 'type1'}
          }],
          then: {
            maximum: 200
          }
        }, {
          if: [{
            kind: {equals: 'type2'}
          }],
          then: {
            minimum: 200
          }
        }]
      }],
      additionalItems: {
        type: 'object',
        properties: {
          baz: {
            type: 'string',
            conditions: [{
              if: [{
                kind: {equals: 'type1'}
              }],
              then: {
                enum: ['foo', 'bar', 'baz']
              }
            }]
          }
        }
      }
    }
  }
}
