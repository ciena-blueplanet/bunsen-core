/**
 * @reference https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation
 */

import ipv4Address from './ipv4-address'
import {ipv4AddressBits, networkMaskValid} from './utils'

const firstOctetMax = 253

/* eslint-disable complexity */
/**
 * Validate value as an IPv4 interface
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
  const postPrefixBits = bits.slice(parseInt(networkMask, 10))

  return !/^(0+|1+)$/.test(postPrefixBits)
}
/* eslint-enable complexity */
