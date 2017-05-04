var deepFreeze = require('../../deep-freeze')

/**
 * A bunsen model with conditions nested below the top-level of properties
 */

var simpleModel = require('./simple-model')

module.exports = deepFreeze({
  type: 'object',
  properties: {
    tags: simpleModel
  }
})
