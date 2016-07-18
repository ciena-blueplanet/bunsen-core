import _ from 'lodash'

const regex = /^([\da-f][\da-f](:[\da-f][\da-f])*)?$/i

/**
 * Validate value as a hex string
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is a valid
 */
export default function (value) {
  if (!_.isString(value)) {
    return false
  }

  return regex.test(value)
}
