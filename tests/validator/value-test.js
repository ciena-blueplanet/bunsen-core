'use strict'

const chai = require('chai')
const chaiSubset = require('chai-subset')
const value = require('../../lib/validator/value')
const _ = require('lodash')
chai.use(chaiSubset)
const expect = chai.expect

describe('validator/value', () => {
  describe('.translateMissingRequiredPropertyErrors()', () => {
    let nonRequiredError, requiredError1, requiredError2

    beforeEach(() => {
      nonRequiredError = {
        message: 'This is not a real phone number.',
        path: '#/phone'
      }

      requiredError1 = {
        message: 'Missing required property: first',
        path: '#/name'
      }

      requiredError2 = {
        message: 'Missing required property: last',
        path: '#/name/'
      }
    })

    it('translates missing required property error when path does not have trailing slash', () => {
      const errors = [requiredError1]
      value.translateMissingRequiredPropertyErrors(errors)
      expect(errors.length).to.equal(1)
      expect(errors[0]).to.eql({
        isRequiredError: true,
        message: 'Field is required.',
        path: '#/name/first'
      })
    })

    it('translates missing required property error when path has trailing slash', () => {
      const errors = [requiredError2]
      value.translateMissingRequiredPropertyErrors(errors)
      expect(errors.length).to.equal(1)
      expect(errors[0]).to.eql({
        isRequiredError: true,
        message: 'Field is required.',
        path: '#/name/last'
      })
    })

    it('does not translate non-missing required property error', () => {
      const errors = [nonRequiredError]
      value.translateMissingRequiredPropertyErrors(errors)
      expect(errors.length).to.equal(1)
      expect(errors[0]).to.eql(nonRequiredError)
    })

    it('processes error arrays containing required and non-required errors', () => {
      const errors = [nonRequiredError, requiredError1]
      value.translateMissingRequiredPropertyErrors(errors)
      expect(errors.length).to.equal(2)
      expect(errors[0]).to.eql(nonRequiredError)
      expect(errors[1]).to.eql({
        isRequiredError: true,
        message: 'Field is required.',
        path: '#/name/first'
      })
    })
  })

  describe('.translateRegexErrors()', () => {
    let errors

    beforeEach(() => {
      errors = [
        {
          message: `String does not match pattern ${value.integerRegex}: foo-bar`
        },
        {
          message: `String does not match pattern ${value.ipAddressRangeRegex}: 192.168.1.2/a`
        }
      ]

      value.translateRegexErrors(errors)
    })

    it('translates integer regex error', () => {
      expect(errors[0].message).to.equal('String does not match pattern for an integer: foo-bar')
    })

    it('translates ip range regex error', () => {
      expect(errors[1].message).to.equal('String does not match pattern for an IP address: 192.168.1.2/a')
    })
  })
  describe('array schemas with tuples', function () {
    const model = {
      type: 'array',
      items: [{
        type: 'string'
      }, {
        type: 'number'
      }, {
        type: 'boolean'
      }]
    }
    it('validate against each item in the array', function () {
      const val = ['value', 1, false]
      const successResult = value.validate(val, model)
      expect(successResult.warnings).to.have.length(0)
      expect(successResult.errors).to.have.length(0)
      val[2] = 1
      const failedResult = value.validate(val, model)
      expect(failedResult.errors).not.to.have.length(0)
    })

    it('passes validation when more items are in the array and "additionalItems" is true', function () {
      const val = ['value', 1, false, 'other']
      const result = value.validate(val, _.assign({additionalItems: true}, model))
      expect(result.errors).to.have.length(0)
    })
    it('fails validation if more items are in the array and "additionalItems" is false', function () {
      const val = ['value', 1, false, 'other']
      const result = value.validate(val, _.assign({additionalItems: false}, model))
      expect(result.errors).not.to.have.length(0)
    })
  })
})
