'use strict'

const expect = require('chai').expect
const validatorFactory = require('../../lib/validator/cell')

describe('validator/cell', () => {
  let validator, cell, result, cellDefinitions, model, renderers

  beforeEach(() => {
    cellDefinitions = [
      {
        id: 'main',
        children: []
      },
      {
        id: 'top',
        children: []
      },
      {
        id: 'middle',
        children: []
      },
      {
        id: 'bottom',
        children: []
      }
    ]

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

    const ownerMock = {
      hasRegistration (id) {
        return id === 'component:foo-bar-renderer'
      }
    }

    validator = validatorFactory(cellDefinitions, model, renderers, ownerMock)
  })

  describe('.validate()', () => {
    describe('when valid', () => {
      beforeEach(() => {
        cell = {
          children: [
            [{model: 'firstName'}],
            [{model: 'lastName'}],
            [{model: 'alias'}]
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
            [{model: 'firstName'}],
            [{model: 'lastName'}],
            [{model: 'alias'}]
          ],
          classNames: {
            cell: 'col-sm-12'
          },
          defaultClassName: 'col-sm-4',
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
            [
              {model: 'firstName'},
              {
                model: 'lastName',
                renderer: {
                  name: 'BazComponent'
                }
              }
            ],
            [
              {
                classNames: {
                  cell: 'col-sm-4'
                }
              },
              {
                model: 'bad-field-name'
              }
            ],
            [
              {
                model: 'alias',
                renderer: {
                  name: 'FooComponent'
                }
              },
              {extends: 'bad-cell-name'}
            ],
            [{extends: 'top'}, {extends: 'bottom', bar: 'baz'}],
            [
              {model: 'firstName'},
              {
                model: 'lastName',
                renderer: {
                  name: 'foo-bar-renderer'
                }
              }
            ]
          ]
        }
        result = validator.validate('#/cellDefinitions/0', cell, model)
      })

      it('returns proper result', () => {
        expect(result).deep.equal({
          errors: [
            {
              path: '#/cellDefinitions/0/children/0/1/renderer',
              message: 'Invalid renderer reference "BazComponent"'
            },
            {
              path: '#/cellDefinitions/0/children/1/0',
              message: 'Either "model" or "extends" must be defined for each cell.'
            },
            {
              path: '#/cellDefinitions/0/children/1/1/model',
              message: 'Invalid model reference "bad-field-name"'
            },
            {
              path: '#/cellDefinitions/0/children/2/1/extends',
              message: 'Invalid extends reference "bad-cell-name"'
            }
          ],
          warnings: [
            {
              path: '#/cellDefinitions/0/children/3/1',
              message: 'Unrecognized attribute "bar"'
            }
          ]
        })
      })
    })
  })
})
