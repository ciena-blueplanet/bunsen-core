import rangeFnFactory from './range-fn-factory'

const max = 2147483647
const min = -2147483648

/**
 * Validate value as a signed 32-bit integer
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default rangeFnFactory(min, max)
