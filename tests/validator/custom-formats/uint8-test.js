const expect = require('chai').expect

const uint8 = require('../../../lib/validator/custom-formats/uint8')

describe('validator/custom-formats/uint8', () => {
  it('returns false when value is undefined', () => {
    expect(uint8(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(uint8(null)).to.be.equal(false)
  })

  it('returns false when value is a string', () => {
    expect(uint8('test')).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(uint8({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(uint8([])).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(uint8(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(uint8(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(uint8(Infinity)).to.be.equal(false)
  })

  it('returns false when value = -1', () => {
    expect(uint8(-1)).to.be.equal(false)
    expect(uint8('-1')).to.be.equal(false)
  })

  it('returns true when 0 <= value <= 255', () => {
    expect(uint8(0)).to.be.equal(true)
    expect(uint8('0')).to.be.equal(true)
    expect(uint8(255)).to.be.equal(true)
    expect(uint8('255')).to.be.equal(true)
  })

  it('returns false when value > 255', () => {
    expect(uint8(256)).to.be.equal(false)
    expect(uint8('256')).to.be.equal(false)
  })
})
