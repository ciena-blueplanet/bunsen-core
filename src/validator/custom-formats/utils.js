export const networkMaskMax = 32
export const networkMaskMin = 0
export const macMaskMax = 48
export const macMaskMin = 0
export const macMulticastMaskRegex = /^multicast$/i
export const macMulticastBit = 7

/**
 * Convert decimal value to binary representation
 * @param {Number} decimal - decimal value to convert to binary
 * @returns {String} string containing binary representation
 */
export function decimalToBinary (decimal) {
  // NOTE: we are applying two's complement so we can properly represent negative
  // numbers in binary. See: https://en.wikipedia.org/wiki/Two%27s_complement
  const PAD = '00000000'
  const twosComplement = decimal >>> 0
  const binaryStr = twosComplement.toString(2)
  return PAD.substring(binaryStr.length) + binaryStr
}

/**
 * Convert decimal value to binary representation
 * @param {Number} hexString - decimal value to convert to binary
 * @returns {String} string containing binary representation
 */
export function hexToBinary (hexString) {
  return parseInt(hexString, 16).toString(2)
}

/**
 * Determine whether or not network mask is valid
 * @param {String} value - string representation of network mask
 * @returns {Boolean} whether or not network mask is valid
 */
export function networkMaskValid (value) {
  const networkMask = parseInt(value, 10)

  return (
    networkMask >= networkMaskMin &&
    networkMask <= networkMaskMax
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
 * Get bits representation of IP address
 * @param {String} ipAddress - IP address in dot notation (ie 127.0.0.1)
 * @returns {String} bits
 */
export function ipAddressBits (ipAddress) {
  return ipAddress.split('.')
    .map(decimalToBinary)
    .join('')
}

/**
 * Get bits representation of MAC address
 * @param {String} macAddress - MAC address (i.e. xx:xx:xx:xx:xx:xx)
 * @returns {String} bits
 */
export function macAddressBits (macAddress) {
  return macAddress.split(':')
    .map(hexToBinary)
    .join('')
}
