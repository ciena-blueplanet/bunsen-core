/**
 * @reference https://en.wikipedia.org/wiki/IPv4
 */

import {isIP} from 'validator'

/**
 * Validate value as an IPv4 address
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  try {
    return (
      isIP(value, 4) &&
      !/^0[1-9]/.test(value) && // Prevent leading 0's in first octect
      !/\.0[1-9]/.test(value) // Prevent leading 0's in other octets
    )
  } catch (err) {
    return false
  }
}
