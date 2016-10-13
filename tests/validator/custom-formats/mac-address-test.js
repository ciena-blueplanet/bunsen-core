const expect = require('chai').expect

const macAddress = require('../../../lib/validator/custom-formats/mac-address')

describe('validator/custom-formats/mac-address', () => {
  it('returns false when value is undefined', () => {
    expect(macAddress(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(macAddress(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(macAddress({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(macAddress([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(macAddress(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(macAddress(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(macAddress(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(macAddress(Infinity)).to.be.equal(false)
  })

  it('returns false when value does not consist of six groups', () => {
    expect(macAddress('00')).to.be.equal(false)
    expect(macAddress('00:00')).to.be.equal(false)
    expect(macAddress('00:00:00')).to.be.equal(false)
    expect(macAddress('00:00:00:00')).to.be.equal(false)
    expect(macAddress('00:00:00:00:00')).to.be.equal(false)
  })

  it('returns false when groups contain non-hex characters', () => {
    expect(macAddress('0g:00:00:00:00:00')).to.be.equal(false)
    expect(macAddress('00:0g:00:00:00:00')).to.be.equal(false)
    expect(macAddress('00:00:0g:00:00:00')).to.be.equal(false)
    expect(macAddress('00:00:00:0g:00:00')).to.be.equal(false)
    expect(macAddress('00:00:00:00:0g:00')).to.be.equal(false)
    expect(macAddress('00:00:00:00:00:0g')).to.be.equal(false)
  })

  it('returns false when groups contain negative numbers', () => {
    expect(macAddress('-01:00:00:00:00:00')).to.be.equal(false)
    expect(macAddress('00:-01:00:00:00:00')).to.be.equal(false)
    expect(macAddress('00:00:-01:00:00:00')).to.be.equal(false)
    expect(macAddress('00:00:00:-01:00:00')).to.be.equal(false)
    expect(macAddress('00:00:00:00:-01:00')).to.be.equal(false)
    expect(macAddress('00:00:00:00:00:-01')).to.be.equal(false)
  })

  it('returns true when valid MAC address', () => {
    expect(macAddress('00:00:00:00:00:00')).to.be.equal(true)
    expect(macAddress('01:b8:00:42:00:2e')).to.be.equal(true)
  })
})
