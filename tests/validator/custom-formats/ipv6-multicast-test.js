const expect = require('chai').expect

const ipv6Multicast = require('../../../lib/validator/custom-formats/ipv6-multicast')

describe('validator/custom-formats/ipv6-multicast', () => {
  it('returns false when value is undefined', () => {
    expect(ipv6Multicast(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(ipv6Multicast(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(ipv6Multicast({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(ipv6Multicast([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(ipv6Multicast(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(ipv6Multicast(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(ipv6Multicast(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(ipv6Multicast(Infinity)).to.be.equal(false)
  })

  it('returns false when value does not consist of eight groups', () => {
    expect(ipv6Multicast('0000/0')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
  })

  it('returns false when groups contain non-hex characters', () => {
    expect(ipv6Multicast('000g:0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:000g:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:000g:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:000g:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:000g:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:000g:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:0000:000g:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:0000:0000:000g')).to.be.equal(false)
  })

  it('returns false when groups contain negative numbers', () => {
    expect(ipv6Multicast('-0001:0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:-0001:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:-0001:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:-0001:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:-0001:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:-0001:0000:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:0000:-0001:0000')).to.be.equal(false)
    expect(ipv6Multicast('0000:0000:0000:0000:0000:0000:0000:-0001')).to.be.equal(false)
  })

  it('returns false when invalid IPv6 multicast', () => {
    expect(ipv6Multicast('::1')).to.be.equal(false)
    expect(ipv6Multicast('::')).to.be.equal(false)
    expect(ipv6Multicast('FEDC:BA98:7654::FEDC::3210')).to.be.equal(false)
  })

  it('returns true when valid IPv6 multicast', () => {
    expect(ipv6Multicast('FFDC:BA98:7654:3210:FEDC:BA98:7654:3210')).to.be.equal(true)
    expect(ipv6Multicast('FF80:0:0:0:8:800:200C:417A')).to.be.equal(true)
  })
})
