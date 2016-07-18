import rangeFnFactory from './range-fn-factory'

const max = 255
const min = 0

/**
 * Validate value as an unsigned 8-bit integer
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default rangeFnFactory(min, max)
