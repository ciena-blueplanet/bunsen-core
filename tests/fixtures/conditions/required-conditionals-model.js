var deepFreeze = require('../../deep-freeze')

/**
 * Bunsen model with conditionally required properties
 */

module.exports = deepFreeze({
  type: 'object',
  properties: {
    tagType: {
      type: 'string',
      enum: ['untagged', 'single-tagged', 'double-tagged']
    },
    tag: {
      type: 'string',
      conditions: [{
        if: [{
          tagType: {equals: 'single-tagged'}
        }, {
          tagType: {equals: 'double-tagged'}
        }],
        required: true
      }]
    },
    tag2: {
      type: 'string',
      conditions: [{
        if: [{
          tagType: {equals: 'double-tagged'}
        }],
        required: true
      }]
    }
  }
})
