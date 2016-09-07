const expect = require('chai').expect

const portNumber = require('../../../lib/validator/custom-formats/port-number')

describe('validator/custom-formats/port-number', () => {
  it('returns false when value is undefined', () => {
    expect(portNumber(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(portNumber(null)).to.be.equal(false)
  })

  it('returns false when value is a string', () => {
    expect(portNumber('test')).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(portNumber({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(portNumber([])).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(portNumber(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(portNumber(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(portNumber(Infinity)).to.be.equal(false)
  })

  it('returns false when value < 0', () => {
    expect(portNumber(-1)).to.be.equal(false)
    expect(portNumber('-1')).to.be.equal(false)
  })

  it('returns false when value = 0', () => {
    expect(portNumber(0)).to.be.equal(false)
    expect(portNumber('0')).to.be.equal(false)
  })

  it('returns true when 1 <= value <= 65535', () => {
    expect(portNumber(1)).to.be.equal(true)
    expect(portNumber('1')).to.be.equal(true)
    expect(portNumber(65535)).to.be.equal(true)
    expect(portNumber('65535')).to.be.equal(true)
  })

  it('returns false when value > 65535', () => {
    expect(portNumber(65536)).to.be.equal(false)
    expect(portNumber('65536')).to.be.equal(false)
  })
})
