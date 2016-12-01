const expect = require('chai').expect

const ipv6Interface = require('../../../lib/validator/custom-formats/ipv6-interface')

describe('validator/custom-formats/IPv6-interface', () => {
  it('returns false when value is undefined', () => {
    expect(ipv6Interface(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(ipv6Interface(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(ipv6Interface({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(ipv6Interface([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(ipv6Interface(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(ipv6Interface(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(ipv6Interface(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(ipv6Interface(Infinity)).to.be.equal(false)
  })

  it('returns false when network mask is missing', () => {
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000:0000:0000')).to.be.equal(false)
  })

  it('returns false when value does not consist of eight groups', () => {
    expect(ipv6Interface('0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000:0000/0')).to.be.equal(false)
  })

  it('returns false when groups contain non-hex characters', () => {
    expect(ipv6Interface('000g:0000:0000:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:000g:0000:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:000g:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:000g:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:000g:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:000g:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000:000g:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000:0000:000g/0')).to.be.equal(false)
  })

  it('returns false when groups contain negative numbers', () => {
    expect(ipv6Interface('-0001:0000:0000:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:-0001:0000:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:-0001:0000:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:-0001:0000:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:-0001:0000:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:-0001:0000:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000:-0001:0000/0')).to.be.equal(false)
    expect(ipv6Interface('0000:0000:0000:0000:0000:0000:0000:-0001/0')).to.be.equal(false)
  })

  it('returns false when invalid IPv6 interface', () => {
    expect(ipv6Interface('12AB:0:0:CD3/60')).to.be.equal(false)
    expect(ipv6Interface('fe80::6a05:caff:fe05:f789/128')).to.be.equal(false)
  })

  it('returns true when valid IPv6 interface', () => {
    expect(ipv6Interface('1080:0:0:0:8:800:200C:417A/32')).to.be.equal(true)
    expect(ipv6Interface('12AB::CD30/60')).to.be.equal(true)
    expect(ipv6Interface('12AB::CD3/60')).to.be.equal(true)
    expect(ipv6Interface('12AB:0:0:CD30:123:4567:89AB:CDEF/60')).to.be.equal(true)
    expect(ipv6Interface('fe80::6a05:caff:fe05:f789/64')).to.be.equal(true)
    expect(ipv6Interface('FEDC:BA98:7654:3210:FEDC:BA98:7654:3210/68')).to.be.equal(true)
  })
})
