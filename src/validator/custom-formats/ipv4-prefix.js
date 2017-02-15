/**
 * @reference https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation
 */

import ipv4Address from './ipv4-address'
import {ipv4AddressBits, networkMaskValid} from './utils'

const firstOctetMax = 253

/* eslint-disable complexity */
/**
 * Validate value as an IPv4 prefix
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  if (!(typeof value === 'string' || value instanceof String)) {
    return false
  }

  const [ipAddress, networkMask] = value.split('/')

  if (!networkMaskValid(networkMask)) {
    return false
  }

  if (!ipv4Address(ipAddress)) {
    return false
  }

  const octets = ipAddress.split('.')

  if (parseInt(octets[0], 10) > firstOctetMax) {
    return false
  }

  const bits = ipv4AddressBits(ipAddress)
  const zeroBits = bits.slice(parseInt(networkMask, 10))

  if (networkMask === '32') {
    return zeroBits.length === 0
  }

  return /^0+$/.test(zeroBits)
}
/* eslint-enable complexity */
