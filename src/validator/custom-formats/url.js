import validator from 'validator'

/**
 * Validate value as a URL
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  try {
    return validator.isURL(value)
  } catch (err) {
    return false
  }
}
