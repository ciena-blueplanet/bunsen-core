'use strict'

const expect = require('chai').expect
const validatorFactory = require('../../lib/validator/container')

describe('validator/container', () => {
  let validator, container, result, containers, model, renderers

  beforeEach(() => {
    containers = [
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
      lookup (id) {
        return id === 'component:foo-bar-renderer'
      }
    }

    validator = validatorFactory(containers, model, renderers, ownerMock)
  })

  describe('.validate()', () => {
    describe('when valid', () => {
      beforeEach(() => {
        container = {
          children: [
            [{model: 'firstName'}],
            [{model: 'lastName'}],
            [{model: 'alias'}]
          ]
        }
        result = validator.validate('#/containers/0', container, model)
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
        container = {
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
        result = validator.validate('#/containers/0', container, model)
      })

      it('returns proper result', () => {
        expect(result).deep.equal({
          errors: [],
          warnings: [
            {
              path: '#/containers/0',
              message: 'Unrecognized attribute "foo"'
            }
          ]
        })
      })
    })

    describe('when cells have bad references', () => {
      beforeEach(() => {
        container = {
          children: [
            [{model: 'firstName'}, {model: 'lastName', renderer: 'BazComponent'}],
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
            [{model: 'alias', renderer: 'FooComponent'}, {container: 'bad-container-name'}],
            [{container: 'top'}, {container: 'bottom', bar: 'baz'}],
            [{model: 'firstName'}, {model: 'lastName', renderer: 'foo-bar-renderer'}]
          ]
        }
        result = validator.validate('#/containers/0', container, model)
      })

      it('returns proper result', () => {
        expect(result).deep.equal({
          errors: [
            {
              path: '#/containers/0/children/0/1/renderer',
              message: 'Invalid renderer reference "BazComponent"'
            },
            {
              path: '#/containers/0/children/1/0',
              message: 'Either "model" or "container" must be defined for each cell.'
            },
            {
              path: '#/containers/0/children/1/1/model',
              message: 'Invalid model reference "bad-field-name"'
            },
            {
              path: '#/containers/0/children/2/1/container',
              message: 'Invalid container reference "bad-container-name"'
            }
          ],
          warnings: [
            {
              path: '#/containers/0/children/3/1',
              message: 'Unrecognized attribute "bar"'
            }
          ]
        })
      })
    })
  })
})
