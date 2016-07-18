import rangeFnFactory from './range-fn-factory'

const max = 127
const min = -128

/**
 * Validate value as a signed 8-bit integer
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default rangeFnFactory(min, max)
