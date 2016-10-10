const expect = require('chai').expect

const uint64 = require('../../../lib/validator/custom-formats/uint64')

describe('validator/custom-formats/unit64', () => {
  it('returns false when value is undefined', () => {
    expect(uint64(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(uint64(null)).to.be.equal(false)
  })

  it('returns false when value is a string', () => {
    expect(uint64('test')).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(uint64({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(uint64([])).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(uint64(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(uint64(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(uint64(Infinity)).to.be.equal(false)
  })

  it('returns true when value is an integer', () => {
    expect(uint64(0)).to.be.equal(true)
  })

  it('returns false when value < 0', () => {
    expect(uint64(-1)).to.be.equal(false)
    expect(uint64('-1')).to.be.equal(false)
  })

  it('returns true when 0 <= value <= 18446744073709551615', () => {
    expect(uint64(0)).to.be.equal(true)
    expect(uint64('0')).to.be.equal(true)
    expect(uint64('18446744073709551615')).to.be.equal(true)
    expect(uint64('1844675409551614')).to.be.equal(true)
    expect(uint64('1844684451614')).to.be.equal(true)
    expect(uint64('1844774414')).to.be.equal(true)
    expect(uint64('1845674')).to.be.equal(true)
  })

  it('returns false when value > 18446744073709551615', () => {
    expect(uint64('18446744073709551616')).to.be.equal(false)
    expect(uint64('18446744073709551625')).to.be.equal(false)
    expect(uint64('18446744073709551715')).to.be.equal(false)
    expect(uint64('18446744073709651615')).to.be.equal(false)
    expect(uint64('18446744073719551615')).to.be.equal(false)
    expect(uint64('18446744073809551615')).to.be.equal(false)
    expect(uint64('18446744074709551615')).to.be.equal(false)
    expect(uint64('18446744083709551615')).to.be.equal(false)
    expect(uint64('18446744173709551615')).to.be.equal(false)
    expect(uint64('18446745073709551615')).to.be.equal(false)
    expect(uint64('18446844073709551615')).to.be.equal(false)
    expect(uint64('18447744073709551615')).to.be.equal(false)
    expect(uint64('18456744073709551615')).to.be.equal(false)
    expect(uint64('18546744073709551615')).to.be.equal(false)
    expect(uint64('19446744073709551615')).to.be.equal(false)
    expect(uint64('28446744073709551615')).to.be.equal(false)
  })
})
