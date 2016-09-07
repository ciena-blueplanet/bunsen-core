const expect = require('chai').expect

const int16 = require('../../../lib/validator/custom-formats/int16')

describe('validator/custom-formats/int16', () => {
  it('returns false when value is undefined', () => {
    expect(int16(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(int16(null)).to.be.equal(false)
  })

  it('returns false when value is a non-numeric string', () => {
    expect(int16('test')).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(int16({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(int16([])).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(int16(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(int16(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(int16(Infinity)).to.be.equal(false)
  })

  it('returns false when value < -32768', () => {
    expect(int16(-32769)).to.be.equal(false)
    expect(int16('-32769')).to.be.equal(false)
  })

  it('returns true when -32768 <= value <= 32767', () => {
    expect(int16(-32768)).to.be.equal(true)
    expect(int16('-32768')).to.be.equal(true)
    expect(int16(32767)).to.be.equal(true)
    expect(int16('32767')).to.be.equal(true)
  })

  it('returns false when value > 32767', () => {
    expect(int16(32768)).to.be.equal(false)
    expect(int16('32768')).to.be.equal(false)
  })
})
