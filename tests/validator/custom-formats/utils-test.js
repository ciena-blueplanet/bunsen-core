const expect = require('chai').expect
var utils = require('../../../lib/validator/custom-formats/utils')

describe('validator/custom-formats/utils', function () {
  describe('hexToBinary', function () {
    it('converts hexidecimal to binary properly', function () {
      expect(utils.hexToBinary(8, '0xff')).to.equal('11111111')
    })
    it('pads the binary number with 0s', function () {
      expect(utils.hexToBinary(8, '0x1')).to.equal('00000001')
    })
  })

  describe('isMacMaskValid', function () {
    it('returns true when mask is within range', function () {
      expect(utils.isMacMaskValid('0')).to.equal(true)
      expect(utils.isMacMaskValid('48')).to.equal(true)
    })

    it('returns false when mask is not in range', function () {
      expect(utils.isMacMaskValid('64')).to.equal(false)
    })

    it('returns true when mask is multicast', function () {
    })
  })

  describe('isMacMulticastAddress', function () {
    it('returns true when multicast is set', function () {
      expect(utils.isMacMulticastAddress('01:00:00:00:00:00')).to.equal(true)
    })

    it('returns false when multicast bit is not set', function () {
      expect(utils.isMacMulticastAddress('00:00:00:00:00:00')).to.equal(false)
    })
  })
})
