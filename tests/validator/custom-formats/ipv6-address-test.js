const expect = require('chai').expect

const ipv6Address = require('../../../lib/validator/custom-formats/ipv6-address')

describe('validator/custom-formats/ipv6-address', () => {
  it('returns false when value is undefined', () => {
    expect(ipv6Address(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(ipv6Address(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(ipv6Address({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(ipv6Address([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(ipv6Address(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(ipv6Address(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(ipv6Address(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(ipv6Address(Infinity)).to.be.equal(false)
  })

  it('returns false when value does not consist of eight groups', () => {
    expect(ipv6Address('0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
  })

  it('returns false when groups contain non-hex characters', () => {
    expect(ipv6Address('000g:0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:000g:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:000g:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:000g:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:000g:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:000g:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:0000:000g:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:0000:0000:000g')).to.be.equal(false)
  })

  it('returns false when groups contain negative numbers', () => {
    expect(ipv6Address('-0001:0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:-0001:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:-0001:0000:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:-0001:0000:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:-0001:0000:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:-0001:0000:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:0000:-0001:0000')).to.be.equal(false)
    expect(ipv6Address('0000:0000:0000:0000:0000:0000:0000:-0001')).to.be.equal(false)
  })

  it('returns true when valid IPv6 address', () => {
    expect(ipv6Address('0000:0000:0000:0000:0000:0000:0000:0000')).to.be.equal(true)
    expect(ipv6Address('2001:0db8:0000:0042:0000:8a2e:0370:7334')).to.be.equal(true)
  })
})
