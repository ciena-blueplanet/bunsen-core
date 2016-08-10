const regex = /^([\da-f][\da-f](:[\da-f][\da-f])*)?$/i

/**
 * Validate value as a hex string
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is a valid
 */
export default function (value) {
  if (!(typeof value === 'string' || value instanceof String)) {
    return false
  }

  return regex.test(value)
}
