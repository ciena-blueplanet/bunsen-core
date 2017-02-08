'use strict'
var _ = require('lodash')

class ExpectedValue {
  constructor (base) {
    this._value = _.cloneDeep(base)
  }
  get value () {
    return this._value
  }
}

module.exports = ExpectedValue
