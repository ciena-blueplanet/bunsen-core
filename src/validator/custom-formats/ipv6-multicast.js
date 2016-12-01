import ipv6Address from './ipv6-address'

/**
 * Validate value as an IPv6 prefix
 * @param {Any} value - value to validate
 * @returns {Boolean} whether or not value is valid
 */
export default function (value) {
  return ipv6Address(value) && value.slice(0, 2).toLowerCase() === 'ff'
}
