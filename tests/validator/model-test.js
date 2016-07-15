'use strict'

const expect = require('chai').expect
const lib = require('../../lib/validator/model')

describe('model validator', () => {
  let model, result

  describe('validateSubModel()', () => {
    describe('when valid', () => {
      beforeEach(() => {
        model = {
          type: 'string',
          title: 'First Name'
        }
        result = lib.validateSubModel('#/properties/firstName', model)
      })

      it('returns proper result', () => {
        expect(result).to.eql({
          errors: [],
          warnings: []
        })
      })
    })

    describe('when type is wrong', () => {
      beforeEach(() => {
        model = {
          type: 'foo-bar'
        }
        result = lib.validateSubModel('#/properties/firstName', model)
      })

      it('returns proper result', () => {
        const errorMsg = 'Invalid value "foo-bar" for "type" Valid options are ' +
          '["string","object","array","integer","number","boolean"]'

        expect(result).to.eql({
          errors: [
            {
              path: '#/properties/firstName',
              message: errorMsg
            }
          ],
          warnings: []
        })
      })
    })
  })
})
