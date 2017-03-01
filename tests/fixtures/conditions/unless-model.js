/**
 * Simple bunsen model with an 'unless' condition
 */

module.exports = {
  type: 'object',
  properties: {
    tagType: {
      type: 'string',
      enum: ['untagged', 'single-tagged', 'double-tagged']
    },
    tag: {
      type: 'number',
      default: 20,
      multipleOf: 1.0,
      minimum: 0,
      maximum: 4094,
      conditions: [{
        unless: [{
          tagType: {equals: 'untagged'}
        }]
      }]
    },
    tag2: {
      type: 'number',
      default: 3000,
      multipleOf: 1.0,
      minimum: 0,
      maximum: 4094,
      conditions: [{
        unless: [{
          tagType: {equals: 'single-tagged'}
        },
        {
          tagType: {equals: 'untagged'}
        }]
      }]
    }
  }
}
