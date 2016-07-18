/**
 * @reference https://en.wikipedia.org/wiki/Autonomous_system_(Internet)
 */

import rangeFnFactory from './range-fn-factory'

const max = 4294967295
const min = 0
const reserved = [
  0,
  65535,
  4294967295
]

/**
 * Validate value as BGP (Border Gateway Protocol) AS (Autonomous System)
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is a valid
 */
export default rangeFnFactory(min, max, reserved)
