const expect = require('chai').expect

const url = require('../../../lib/validator/custom-formats/url')

describe('validator/custom-formats/url', () => {
  it('returns false when value is undefined', () => {
    expect(url(undefined)).to.be.equal(false)
  })

  it('returns false when value is null', () => {
    expect(url(null)).to.be.equal(false)
  })

  it('returns false when value is an object', () => {
    expect(url({})).to.be.equal(false)
  })

  it('returns false when value is an array', () => {
    expect(url([])).to.be.equal(false)
  })

  it('returns false when value is an integer', () => {
    expect(url(1)).to.be.equal(false)
  })

  it('returns false when value is a float', () => {
    expect(url(0.5)).to.be.equal(false)
  })

  it('returns false when value is NaN', () => {
    expect(url(NaN)).to.be.equal(false)
  })

  it('returns false when value is Infinity', () => {
    expect(url(Infinity)).to.be.equal(false)
  })

  it('returns false when value is not valid', () => {
    [
      'a',
      '1'
    ]
      .forEach((value) => {
        expect(url(value)).to.be.equal(false)
      })
  })

  it('returns true when value is valid', () => {
    [
      'https://domain.com',
      'https://subdomain.domain.com',
      'https://www.domain.com',
      'https://www.subdomain.domain.com'
    ]
      .forEach((value) => {
        expect(url(value)).to.be.equal(true)
      })
  })
})
