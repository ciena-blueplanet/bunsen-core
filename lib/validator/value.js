'use strict'

require('../typedefs')

const ZSchema = require('z-schema')
const _ = require('lodash')

const schemaValidator = new ZSchema({
  breakOnFirstError: false
})

const lib = {
  integerRegex: '^[0-9]*$',
  ipAddressRangeRegex: '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}' +
    '([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\\/(\\d|[1-2]\\d|3[0-2]))?$',

  /**
   * Go through the errors and convert any 'String does not match pattern...' errors for known regex patterns
   * @param {BunsenValidationError[]} errors - the list of errors which will be updated in-place
   */
  translateRegexErrors (errors) {
    const regexLabels = {
      [lib.integerRegex]: 'for an integer',
      [lib.ipAddressRangeRegex]: 'for an IP address'
    }

    errors.forEach((error) => {
      _.forIn(regexLabels, (value, key) => {
        if (error.message.indexOf(`String does not match pattern ${key}`) === 0) {
          error.message = error.message.replace(key, value)
        }
      })
    })
  },

  /**
   * Go through the errors and convert any 'Missing required property' errors
   * @param {BunsenValidationError[]} errors - the list of errors which will be updated in-place
   */
  translateMissingRequiredPropertyErrors (errors) {
    errors.forEach((error) => {
      const path = error.path
      const message = error.message

      if (message.indexOf('Missing required property:') === 0) {
        const property = message.split(':').pop().trim()
        const parent = path
        const trailingSlash = (parent.split('').pop() === '/') ? '' : '/'

        _.assign(error, {
          isRequiredError: true,
          message: 'Field is required.',
          path: `${parent}${trailingSlash}${property}`
        })
      }
    })
  },

  /**
   * Validate the given value against it's schema
   * @param {*} value - the view to validate (as an object or JSON string)
   * @param {BunsenModel} model - the JSON schema to validate against
   * @param {Boolean} [required] - if true, value must be present
   * @returns {BunsenValidationResult} the results of the value validation
   */
  validate (value, model, required) {
    if (value === '') {
      if (required) {
        return {
          errors: [
            {
              isRequiredError: true,
              message: 'Field is required.',
              path: ''
            }
          ]
        }
      } else {
        return {
          errors: []
        }
      }
    }

    const valid = schemaValidator.validate(value, model)
    const errors = valid ? [] : schemaValidator.getLastErrors()
    lib.translateMissingRequiredPropertyErrors(errors)
    lib.translateRegexErrors(errors)

    return {
      errors,
      warnings: []
    }
  }
}

module.exports = lib
