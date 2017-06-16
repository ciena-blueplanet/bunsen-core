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
                pinSelectedValues: true,
                updateItemsOnOpen: true,
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

      describe('when pinSelectedValues option is specified', function () {
        it('passes validation when pinSelectedValues is boolean', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is number', function () {
          value.cells[0].renderer.pinSelectedValues = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is integer', function () {
          value.cells[0].renderer.pinSelectedValues = 1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is string', function () {
          value.cells[0].renderer.pinSelectedValues = 'value'
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.pinSelectedValues = {}
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.pinSelectedValues = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.pinSelectedValues = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })

      describe('when updateItemsOnOpen option is specified', function () {
        it('passes validation when updateItemsOnOpen is boolean', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is number', function () {
          value.cells[0].renderer.updateItemsOnOpen = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is integer', function () {
          value.cells[0].renderer.updateItemsOnOpen = 1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is string', function () {
          value.cells[0].renderer.updateItemsOnOpen = 'value'
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.updateItemsOnOpen = {}
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.updateItemsOnOpen = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.updateItemsOnOpen = null
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
                  pinSelectedValues: true,
                  updateItemsOnOpen: true,
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

      describe('when pinSelectedValues option is specified', function () {
        it('passes validation when pinSelectedValues is boolean', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is number', function () {
          value.cells[0].renderer.options.pinSelectedValues = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is integer', function () {
          value.cells[0].renderer.options.pinSelectedValues = 1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is string', function () {
          value.cells[0].renderer.options.pinSelectedValues = 'value'
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.options.pinSelectedValues = {}
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.options.pinSelectedValues = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.options.pinSelectedValues = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })

      describe('when updateItemsOnOpen option is specified', function () {
        it('passes validation when updateItemsOnOpen is boolean', function () {
          expect(schemaValidator.validate(value, model)).to.equal(true)
        })

        it('fails validation when value is number', function () {
          value.cells[0].renderer.options.updateItemsOnOpen = 1.1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is integer', function () {
          value.cells[0].renderer.options.updateItemsOnOpen = 1
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is string', function () {
          value.cells[0].renderer.options.updateItemsOnOpen = 'value'
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('passes validation when value is object', function () {
          value.cells[0].renderer.options.updateItemsOnOpen = {}
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is an array', function () {
          value.cells[0].renderer.options.updateItemsOnOpen = []
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })

        it('fails validation when value is null', function () {
          value.cells[0].renderer.options.updateItemsOnOpen = null
          expect(schemaValidator.validate(value, model)).to.equal(false)
        })
      })
    })
  })

  describe('tableRenderer', function () {
    let tableValue
    beforeEach(function () {
      tableValue = {
        type: 'form',
        version: '2.0',
        cells: [
          {
            model: 'foo',
            renderer: {
              name: 'table'
            }
          }
        ]
      }
    })

    it('passes validation with no options', function () {
      expect(schemaValidator.validate(tableValue, model)).to.equal(true)
    })

    describe('with fields option', function () {
      it('fails validation if not an array', function () {
        tableValue.cells[0].renderer.columns = 'foo,bar,bazz'
        expect(schemaValidator.validate(tableValue, model)).to.equal(false)
      })

      it('passes validation with only string names provided', function () {
        tableValue.cells[0].renderer.columns = ['foo', 'bar', 'bazz']
        expect(schemaValidator.validate(tableValue, model)).to.equal(true)
      })

      it('passes validation with objects with "key" provided', function () {
        tableValue.cells[0].renderer.columns = [{key: 'foo'}]
        expect(schemaValidator.validate(tableValue, model)).to.equal(true)
      })

      it('fails validation with objects if no "key" provided', function () {
        tableValue.cells[0].renderer.columns = [{}]
        expect(schemaValidator.validate(tableValue, model)).to.equal(false)
      })

      it('passes validation with objects with "label" provided', function () {
        tableValue.cells[0].renderer.columns = [{key: 'foo', label: 'Foo'}]
        expect(schemaValidator.validate(tableValue, model)).to.equal(true)
      })

      it('passes validation with objects with "align" provided', function () {
        tableValue.cells[0].renderer.columns = [{key: 'foo', label: 'Foo', align: 'center'}]
        expect(schemaValidator.validate(tableValue, model)).to.equal(true)
      })

      it('passes validation with objects and strings provided', function () {
        tableValue.cells[0].renderer.columns = ['fizz', {key: 'foo', label: 'Foo'}]
        expect(schemaValidator.validate(tableValue, model)).to.equal(true)
      })

      it('fails validation with objects with some random attr', function () {
        tableValue.cells[0].renderer.columns = [{key: 'foo', someRandomThing: 'blarg'}]
        expect(schemaValidator.validate(tableValue, model)).to.equal(false)
      })
    })
  })
})
