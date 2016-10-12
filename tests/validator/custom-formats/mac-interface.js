const expect = require('chai').expect

const macInterface = require('../../../lib/validator/custom-formats/mac-interface')

describe('validator/custom-formats/mac-prefix', () => {
  it('returns false when value is undefined', () => {
    expect(macInterface(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(macInterface(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(macInterface({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(macInterface([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(macInterface(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(macInterface(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(macInterface(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(macInterface(Infinity)).to.be.equal(false)
  })

  it('returns false when MAC mask is missing', () => {
    expect(macInterface('00:00:00:00:00:00')).to.be.equal(false)
  })

  it('returns false when mac address does not consist of six groups', () => {
    expect(macInterface('00:00:00:00:00/0')).to.be.equal(false)
  })

  it('returns false when groups contain non-hex characters', () => {
    expect(macInterface('0g:00:00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:0g:00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:0g:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:0g:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:00:0g:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:00:00:0g/0')).to.be.equal(false)
  })

  it('returns false when groups contain negative numbers', () => {
    expect(macInterface('-00:00:00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:-00:00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:-00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:-00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:00:-00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:00:00:-00/0')).to.be.equal(false)
  })

  it('returns false when groups contain numbers > ff', () => {
    expect(macInterface('1ff:00:00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:1ff:00:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:1ff:00:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:1ff:00:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:00:1ff:00/0')).to.be.equal(false)
    expect(macInterface('00:00:00:00:00:1ff/0')).to.be.equal(false)
  })

  it('returns false when invalid MAC prefix', () => {
    expect(macInterface('ff:ff:00:00:00:00/16')).to.be.equal(false)
  })

  it('returns true when valid MAC prefix', () => {
    expect(macInterface('ff:ff:ff:00:00:00/16')).to.be.equal(true)
    expect(macInterface('ff:ff:ff:00:00:01/24')).to.be.equal(true)
  })
})
