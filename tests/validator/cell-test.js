'use strict'

const expect = require('chai').expect
const validatorFactory = require('../../lib/validator/cell')

describe('validator/cell', () => {
  var validator, cell, result, cellDefinitions, model, renderers

  beforeEach(() => {
    cellDefinitions = {
      bottom: {
        children: []
      },
      main: {
        children: []
      },
      middle: {
        children: []
      },
      top: {
        children: []
      }
    }

    model = {
      type: 'object',
      properties: {
        firstName: {type: 'string'},
        lastName: {type: 'string'},
        alias: {type: 'string'}
      }
    }

    renderers = [
      'FooComponent',
      'BarComponent'
    ]

    function validateRenderer (rendererName) {
      return rendererName === 'foo-bar-renderer'
    }

    validator = validatorFactory(cellDefinitions, model, renderers, validateRenderer)
  })

  describe('.validate()', () => {
    describe('when valid', () => {
      beforeEach(() => {
        cell = {
          children: [
            {model: 'firstName'},
            {model: 'lastName'},
            {model: 'alias'}
          ]
        }
        result = validator.validate('#/cellDefinitions/0', cell, model)
      })

      it('returns proper result', () => {
        expect(result).deep.equal({
          errors: [],
          warnings: []
        })
      })
    })

    describe('when extra attributes are given', () => {
      beforeEach(() => {
        cell = {
          children: [
            {model: 'firstName'},
            {model: 'lastName'},
            {model: 'alias'}
          ],
          classNames: {
            cell: 'col-sm-12'
          },
          foo: 'bar'
        }
        result = validator.validate('#/cellDefinitions/0', cell, model)
      })

      it('returns proper result', () => {
        expect(result).deep.equal({
          errors: [],
          warnings: [
            {
              path: '#/cellDefinitions/0',
              message: 'Unrecognized attribute "foo"'
            }
          ]
        })
      })
    })

    describe('when cells have bad references', () => {
      beforeEach(() => {
        cell = {
          children: [
            {model: 'firstName'},
            {
              model: 'lastName',
              renderer: {
                name: 'BazComponent'
              }
            },
            {
              classNames: {
                cell: 'col-sm-4'
              }
            },
            {
              model: 'bad-field-name'
            },
            {
              model: 'alias',
              renderer: {
                name: 'FooComponent'
              }
            },
            {extends: 'bad-cell-name'},
            {extends: 'top'}, {extends: 'bottom', bar: 'baz'},
            {model: 'firstName'},
            {
              model: 'lastName',
              renderer: {
                name: 'foo-bar-renderer'
              }
            }
          ]
        }
        result = validator.validate('#/cellDefinitions/0', cell, model)
      })

      it('returns proper result', () => {
        expect(result).deep.equal({
          errors: [
            {
              path: '#/cellDefinitions/0/children/1/renderer',
              message: 'Invalid renderer reference "BazComponent"'
            },
            {
              path: '#/cellDefinitions/0/children/2',
              message: '"children", "extends", or "model" must be defined for each cell.'
            },
            {
              path: '#/cellDefinitions/0/children/3/model',
              message: 'Invalid model reference "bad-field-name"'
            },
            {
              path: '#/cellDefinitions/0/children/5/extends',
              message: 'Invalid extends reference "bad-cell-name"'
            }
          ],
          warnings: [
            {
              path: '#/cellDefinitions/0/children/7',
              message: 'Unrecognized attribute "bar"'
            }
          ]
        })
      })
    })
  })

  it('validates against internal models', function () {
    model.properties._internal = {
      type: 'object',
      properties: {
        left: {
          type: 'string'
        },
        right: {
          type: 'number'
        }
      }
    }
    cell = {
      children: [{
        model: 'firstName'
      }, {
        model: '_internal.left'
      }, {
        model: '_internal.right'
      }]
    }
    result = validator.validate('#/cellDefinitions/0', cell)
    expect(result).deep.equal({
      errors: [],
      warnings: []
    })
  })

  it('validates against deep internal models', function () {
    model.properties.foo = {
      type: 'object',
      properties: {
        _internal: {
          type: 'object',
          properties: {
            left: {
              type: 'string'
            },
            right: {
              type: 'number'
            }
          }
        }
      }
    }
    cell = {
      children: [{
        model: 'firstName'
      }, {
        model: 'foo._internal.left'
      }, {
        model: 'foo._internal.right'
      }]
    }
    result = validator.validate('#/cellDefinitions/0', cell)
    expect(result).deep.equal({
      errors: [],
      warnings: []
    })
  })

  it('catches incorrect internal models', function () {
    model.properties.foo = {
      type: 'object',
      properties: {
        _internal: {
          type: 'object',
          properties: {
            left: {
              type: 'string'
            },
            right: {
              type: 'number'
            }
          }
        }
      }
    }
    cell = {
      children: [{
        model: 'firstName',
        children: [{
          model: 'foo._internal.left'
        }]
      }, {
        model: 'foo._internal.right'
      }]
    }
    result = validator.validate('#/cellDefinitions/0', cell)
    expect(result).deep.equal({
      errors: [{
        message: 'Invalid model reference "foo._internal.left"',
        path: '#/cellDefinitions/0/children/0/children/0/model'
      }],
      warnings: []
    })
  })
})
