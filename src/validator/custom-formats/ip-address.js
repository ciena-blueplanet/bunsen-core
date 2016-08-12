/**
 * @reference https://en.wikipedia.org/wiki/IPv4
 * @reference https://en.wikipedia.org/wiki/IPv6
 */

import validator from 'validator'

/**
 * Validate value as an IP address (can be IPv4 or IPv6)
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  try {
    return validator.isIP(value)
  } catch (err) {
    return false
  }
}
