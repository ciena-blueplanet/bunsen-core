'use strict'

const expect = require('chai').expect
const ZSchema = require('z-schema')
const model = require('../../../lib/validator/view-schemas/v2')

describe('v2 schema validation', () => {
  let schemaValidator
  beforeEach(function () {
    schemaValidator = new ZSchema({
      breakOnFirstError: false
    })
  })

  describe('selectRenderer', function () {
    describe('when properties set directly on renderer', function () {
      let value
      beforeEach(function () {
        value = {
          type: 'form',
          version: '2.0',
          cells: [
            {
              model: 'foo',
              renderer: {
                data: [{
                  label: 'label',
                  value: 'value'
                }],
                none: {
                  label: 'None',
                  present: true,
                  value: ''
                },
                name: 'select'
              }
            }
          ]
        }
      })

      describe('when data value is specified', function () {
        it('passes validation when value is string', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is number', function () {
          value.cells[0].renderer.data[0].value = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is integer', function () {
          value.cells[0].renderer.data[0].value = 1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is boolean', function () {
          value.cells[0].renderer.data[0].value = true
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.data[0].value = {}
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.data[0].value = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.data[0].value = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })

      describe('when none value is specified', function () {
        it('passes validation when value is string', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is number', function () {
          value.cells[0].renderer.none.value = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is integer', function () {
          value.cells[0].renderer.none.value = 1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is boolean', function () {
          value.cells[0].renderer.none.value = true
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.none.value = {}
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.none.value = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.none.value = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })
    })

    describe('when properties set on renderer.options', function () {
      let value
      beforeEach(function () {
        value = {
          type: 'form',
          version: '2.0',
          cells: [
            {
              model: 'foo',
              renderer: {
                name: 'select',
                options: {
                  data: [{
                    label: 'label',
                    value: 'value'
                  }],
                  none: {
                    label: 'None',
                    present: true,
                    value: ''
                  }
                }
              }
            }
          ]
        }
      })

      describe('when data value is specified', function () {
        it('passes validation when value is string', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is number', function () {
          value.cells[0].renderer.options.data[0].value = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is integer', function () {
          value.cells[0].renderer.options.data[0].value = 1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is boolean', function () {
          value.cells[0].renderer.options.data[0].value = true
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.options.data[0].value = {}
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.options.data[0].value = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.options.data[0].value = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })

      describe('when none value is specified', function () {
        it('passes validation when value is string', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is number', function () {
          value.cells[0].renderer.options.none.value = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is integer', function () {
          value.cells[0].renderer.options.none.value = 1
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is boolean', function () {
          value.cells[0].renderer.options.none.value = true
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.options.none.value = {}
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.options.none.value = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.options.none.value = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })
    })
  })
})
