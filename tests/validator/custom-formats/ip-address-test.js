const expect = require('chai').expect

const ipAddress = require('../../../lib/validator/custom-formats/ip-address')

describe('validator/custom-formats/ip-address', () => {
  describe('IPv4', function () {
    it('returns false when value is undefined', () => {
      expect(ipAddress(undefined)).to.be.false
    })

    it('returns false when value is null', () => {
      expect(ipAddress(null)).to.be.false
    })

    it('returns false when value is an object', () => {
      expect(ipAddress({})).to.be.false
    })

    it('returns false when value is an array', () => {
      expect(ipAddress([])).to.be.false
    })

    it('returns false when value is an integer', () => {
      expect(ipAddress(1)).to.be.false
    })

    it('returns false when value is a float', () => {
      expect(ipAddress(0.5)).to.be.false
    })

    it('returns false when value is NaN', () => {
      expect(ipAddress(NaN)).to.be.false
    })

    it('returns false when value is Infinity', () => {
      expect(ipAddress(Infinity)).to.be.false
    })

    it('returns false when value does not consist of four octets', () => {
      expect(ipAddress('100.101.102')).to.be.false
    })

    it('returns false when octets contain non-numeric characters', () => {
      expect(ipAddress('100a.101.102.103')).to.be.false
      expect(ipAddress('100.101a.102.103')).to.be.false
      expect(ipAddress('100.101.102a.103')).to.be.false
      expect(ipAddress('100.101.102.103a')).to.be.false
    })

    it('returns false when octets contain negative numbers', () => {
      expect(ipAddress('-100.101.102.103')).to.be.false
      expect(ipAddress('100.-101.102.103')).to.be.false
      expect(ipAddress('100.101.-102.103')).to.be.false
      expect(ipAddress('100.101.102.-103')).to.be.false
    })

    it('returns false when octets contain numbers > 255', () => {
      expect(ipAddress('256.101.102.103')).to.be.false
      expect(ipAddress('100.256.102.103')).to.be.false
      expect(ipAddress('100.101.256.103')).to.be.false
      expect(ipAddress('100.101.102.256')).to.be.false
    })

    it('returns true when valid IPv4 address', () => {
      expect(ipAddress('0.0.0.0')).to.be.true
      expect(ipAddress('127.0.0.1')).to.be.true
      expect(ipAddress('255.255.255.255')).to.be.true
    })
  })

  describe('IPv6', function () {
    it('returns false when value is undefined', () => {
      expect(ipAddress(undefined)).to.be.false
    })

    it('returns false when value is null', () => {
      expect(ipAddress(null)).to.be.false
    })

    it('returns false when value is an object', () => {
      expect(ipAddress({})).to.be.false
    })

    it('returns false when value is an array', () => {
      expect(ipAddress([])).to.be.false
    })

    it('returns false when value is an integer', () => {
      expect(ipAddress(1)).to.be.false
    })

    it('returns false when value is a float', () => {
      expect(ipAddress(0.5)).to.be.false
    })

    it('returns false when value is NaN', () => {
      expect(ipAddress(NaN)).to.be.false
    })

    it('returns false when value is Infinity', () => {
      expect(ipAddress(Infinity)).to.be.false
    })

    it('returns false when value does not consist of eight groups', () => {
      expect(ipAddress('0000')).to.be.false
      expect(ipAddress('0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:0000:0000')).to.be.false
    })

    it('returns false when groups contain non-hex characters', () => {
      expect(ipAddress('000g:0000:0000:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:000g:0000:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:000g:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:000g:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:000g:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:000g:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:0000:000g:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:0000:0000:000g')).to.be.false
    })

    it('returns false when groups contain negative numbers', () => {
      expect(ipAddress('-0001:0000:0000:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:-0001:0000:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:-0001:0000:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:-0001:0000:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:-0001:0000:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:-0001:0000:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:0000:-0001:0000')).to.be.false
      expect(ipAddress('0000:0000:0000:0000:0000:0000:0000:-0001')).to.be.false
    })

    it('returns true when valid IPv6 address', () => {
      expect(ipAddress('0000:0000:0000:0000:0000:0000:0000:0000')).to.be.true
      expect(ipAddress('2001:0db8:0000:0042:0000:8a2e:0370:7334')).to.be.true
    })
  })
})
