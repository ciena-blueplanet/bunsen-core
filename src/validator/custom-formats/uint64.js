const MAX_VALUE = '18446744073709551615'

/**
 * Validate value as an unsigned 64-bit integer
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  value = `${value}`

 // Ensure value is a natural number (positive integers)
  if (!/^\d+$/.test(value)) {
    return false
  }

 // If value has less digits than max value then we can safely say it is valid
  if (value.length < MAX_VALUE.length) {
    return true
  }

 // If value has more digits than max value then we can safely say it is not valid
  if (value.length > MAX_VALUE.length) {
    return false
  }

  const firstHalf = parseInt(value.substr(0, 10))
  const secondHalf = parseInt(value.substr(10))

  return !(
    firstHalf > 1844674407 ||
    (firstHalf === 1844674407 && secondHalf > 3709551615)
  )
}
