const expect = require('chai').expect

const uint32 = require('../../../lib/validator/custom-formats/uint32')

describe('validator/custom-formats/uint32', () => {
  it('returns false when value is undefined', () => {
    expect(uint32(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(uint32(null)).to.be.equal(false)
  })

  it('returns false when value is a string', () => {
    expect(uint32('test')).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(uint32({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(uint32([])).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(uint32(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(uint32(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(uint32(Infinity)).to.be.equal(false)
  })

  it('returns true when value is an integer', () => {
    expect(uint32(0)).to.be.equal(true)
  })

  it('returns false when value < 0', () => {
    expect(uint32(-1)).to.be.equal(false)
    expect(uint32('-1')).to.be.equal(false)
  })

  it('returns true when 0 <= value <= 4294967295', () => {
    expect(uint32(0)).to.be.equal(true)
    expect(uint32('0')).to.be.equal(true)
    expect(uint32(4294967295)).to.be.equal(true)
    expect(uint32('4294967295')).to.be.equal(true)
  })

  it('returns false when value > 4294967295', () => {
    expect(uint32(4294967296)).to.be.equal(false)
    expect(uint32('4294967296')).to.be.equal(false)
  })
})
