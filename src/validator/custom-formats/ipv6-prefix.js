/**
 * @reference https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation
 */

import ipv6Address from './ipv6-address'
import {ipv6AddressBits, networkMaskValid} from './utils'

/* eslint-disable complexity */
/**
 * Validate value as an IPv6 prefix
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  if (!(typeof value === 'string' || value instanceof String)) {
    return false
  }

  const [ipAddress, networkMask] = value.split('/')

  if (!networkMaskValid(networkMask, true)) {
    return false
  }

  if (!ipv6Address(ipAddress)) {
    return false
  }

  const bits = ipv6AddressBits(ipAddress)
  const zeroBits = bits.slice(parseInt(networkMask, 10))

  if (networkMask === '128') {
    return zeroBits.length === 0
  }

  return /^0+$/.test(zeroBits)
}
/* eslint-enable complexity */
