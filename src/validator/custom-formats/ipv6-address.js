/**
 * @reference https://en.wikipedia.org/wiki/IPv6
 */

import validator from 'validator'

/**
 * Validate value as an IPv6 address
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  try {
    return validator.isIP(value, 6)
  } catch (err) {
    return false
  }
}
