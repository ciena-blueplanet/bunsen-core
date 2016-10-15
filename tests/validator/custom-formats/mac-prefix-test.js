const expect = require('chai').expect

const macPrefix = require('../../../lib/validator/custom-formats/mac-prefix')

describe('validator/custom-formats/mac-prefix', () => {
  it('returns false when value is undefined', () => {
    expect(macPrefix(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(macPrefix(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(macPrefix({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(macPrefix([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(macPrefix(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(macPrefix(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(macPrefix(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(macPrefix(Infinity)).to.be.equal(false)
  })

  it('returns false when MAC mask is missing', () => {
    expect(macPrefix('00:00:00:00:00:00')).to.be.equal(false)
  })

  it('returns false when mac address does not consist of six groups', () => {
    expect(macPrefix('00:00:00:00:00/0')).to.be.equal(false)
  })

  it('returns false when groups contain non-hex characters', () => {
    expect(macPrefix('0g:00:00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:0g:00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:0g:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:0g:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:00:0g:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:00:00:0g/0')).to.be.equal(false)
  })

  it('returns false when groups contain negative numbers', () => {
    expect(macPrefix('-00:00:00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:-00:00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:-00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:-00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:00:-00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:00:00:-00/0')).to.be.equal(false)
  })

  it('returns false when groups contain numbers > ff', () => {
    expect(macPrefix('1ff:00:00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:1ff:00:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:1ff:00:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:1ff:00:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:00:1ff:00/0')).to.be.equal(false)
    expect(macPrefix('00:00:00:00:00:1ff/0')).to.be.equal(false)
  })

  it('returns false when invalid MAC interface', () => {
    expect(macPrefix('ff:ff:ff:00:00:00/16')).to.be.equal(false)
    expect(macPrefix('f0:ff:ff:00:00:00/multicast')).to.be.equal(false)
  })

  it('returns true when valid MAC interface', () => {
    expect(macPrefix('ff:ff:00:00:00:00/16')).to.be.equal(true)
    expect(macPrefix('ff:ff:ff:00:00:00/24')).to.be.equal(true)
    expect(macPrefix('ff:ff:ff:00:00:00/multicast')).to.be.equal(true)
  })
})
