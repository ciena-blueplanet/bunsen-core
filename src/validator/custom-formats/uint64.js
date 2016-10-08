import rangeFnFactory from './range-fn-factory'

const max = Number.MAX_SAFE_INTEGER
const min = 0

/**
 * Validate value as an unsigned 64-bit integer
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default rangeFnFactory(min, max)
