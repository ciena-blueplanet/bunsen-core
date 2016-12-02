/**
 * @reference https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation
 */

import ipv6Address from './ipv6-address'
import {networkMaskValid} from './utils'

/**
 * Validate value as an IPv6 interface
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  if (!(typeof value === 'string' || value instanceof String)) {
    return false
  }

  const [ipAddress, networkMask] = value.split('/')

  return (
    ipv6Address(ipAddress) &&
    networkMaskValid(networkMask, true) &&
    networkMask !== '128'
  )
}
