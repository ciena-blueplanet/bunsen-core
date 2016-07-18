import {isURL} from 'validator'

/**
 * Validate value as a URL
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  try {
    return isURL(value)
  } catch (err) {
    return false
  }
}
