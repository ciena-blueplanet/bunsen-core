export const networkMaskIpv4Max = 32
export const networkMaskIpv4Min = 0
export const networkMaskIpv6Max = 128
export const networkMaskIpv6Min = 0
export const macMaskMax = 48
export const macMaskMin = 0
export const macMulticastMaskRegex = /^multicast$/i
export const macMulticastBit = 7

/**
 * Convert decimal value to binary representation
 * @param {Number} length - how long binary representation should be (padded on left by 0's)
 * @param {Number} decimal - decimal value to convert to binary
 * @returns {String} string containing binary representation
 */
export function decimalToBinary (length, decimal) {
  // NOTE: we are applying two's complement so we can properly represent negative
  // numbers in binary. See: https://en.wikipedia.org/wiki/Two%27s_complement
  const PAD = '0'.repeat(length)
  const twosComplement = decimal >>> 0
  const binaryStr = twosComplement.toString(2)
  return PAD.substring(binaryStr.length) + binaryStr
}

/**
 * Convert decimal value to binary representation
 * @param {Number} length - how long binary representation should be (padded on left by 0's)
 * @param {Number} hexString - decimal value to convert to binary
 * @returns {String} string containing binary representation
 */
export function hexToBinary (length, hexString) {
  return decimalToBinary(length, parseInt(hexString, 16))
}

/**
 * Determine whether or not network mask is valid
 * @param {String} value - string representation of network mask
 * @param {Boolean} [ipv6=false] - whether or not IP is IPv6 (default is IPv4)
 * @returns {Boolean} whether or not network mask is valid
 */
export function networkMaskValid (value, ipv6 = false) {
  const max = ipv6 ? networkMaskIpv6Max : networkMaskIpv4Max
  const min = ipv6 ? networkMaskIpv6Min : networkMaskIpv4Min
  const networkMask = parseInt(value, 10)

  return (
    networkMask >= min &&
    networkMask <= max
  )
}

/**
 * Determine whether or not MAC mask is valid
 * @param {String} value - mask value
 * @returns {Boolean} whether or not mask is valid
 */
export function isMacMaskValid (value) {
  // Ciena allows /multicast as an option for the mask
  if (macMulticastMaskRegex.test(value)) {
    return true
  }

  const mask = parseInt(value, 10)
  return mask >= macMaskMin && mask <= macMaskMax
}

/**
 * Tests whether the address is a valid multicast address
 * @param {String} value - mac address value
 * @returns {Boolean} whether the address is a valid multicast address
 */
export function isMacMulticastAddress (value) {
  return macAddressBits(value).charAt(macMulticastBit) === '1'
}

/**
 * Get bits representation of IPv4 address
 * @param {String} ipAddress - IP address in dot notation (ie 127.0.0.1)
 * @param {Boolean} [ipv6=false] - whether or not IP is IPv6 (default is IPv4)
 * @returns {String} bits
 */
export function ipv4AddressBits (ipAddress) {
  return ipAddress.split('.')
    .map(decimalToBinary.bind(null, 8))
    .join('')
}

/**
 * Get bits representation of IPv6 address
 * @param {String} ipAddress - IP address in dot notation (ie 127.0.0.1)
 * @param {Boolean} [ipv6=false] - whether or not IP is IPv6 (default is IPv4)
 * @returns {String} bits
 */
export function ipv6AddressBits (ipAddress) {
  // Make sure we have 8 groups. For example the following conversions:
  // :: -> :::::::
  // 1::2 -> 1::::::2
  // 1:2::3 -> 1:2::::::3
  if (ipAddress.indexOf('::') !== -1) {
    const count = ipAddress.split(':').length
    ipAddress = ipAddress.replace('::', ':'.repeat(10 - count))
  }

  const groups = ipAddress.split(':')

  return groups
    .map(hexToBinary.bind(null, 16))
    .join('')
}

/**
 * Get bits representation of MAC address
 * @param {String} macAddress - MAC address (i.e. xx:xx:xx:xx:xx:xx)
 * @returns {String} bits
 */
export function macAddressBits (macAddress) {
  return macAddress.split(':')
    .map(hexToBinary.bind(null, 8))
    .join('')
}
