'use strict'

const expect = require('chai').expect
const validator = require('../../lib/validator')

describe('validator', () => {
  // Testing various ways to define cells
  ;[
    {
      cells: [
        {
          model: 'foo'
        }
      ],
      type: 'form',
      version: '2.0'
    },
    /* FIXME: get below view working
    {
      cellDefinitions: {
        foo: {
          model: 'foo'
        }
      },
      cells: [
        {
          extends: 'foo'
        }
      ],
      type: 'form',
      version: '2.0'
    },
    */
    {
      cells: [
        {
          children: [
            {
              model: 'foo'
            }
          ]
        }
      ],
      type: 'form',
      version: '2.0'
    },
    {
      cellDefinitions: {
        foo: {
          model: 'foo'
        }
      },
      cells: [
        {
          children: [
            {
              extends: 'foo'
            }
          ]
        }
      ],
      type: 'form',
      version: '2.0'
    },
    {
      cellDefinitions: {
        foo: {
          children: [
            {
              model: 'foo'
            }
          ]
        }
      },
      cells: [
        {
          extends: 'foo'
        }
      ],
      type: 'form',
      version: '2.0'
    }
  ]
    .forEach((view) => {
      describe('when valid', () => {
        var result

        beforeEach(() => {
          const model = {
            properties: {
              foo: {
                type: 'string'
              }
            },
            type: 'object'
          }

          const ownerMock = {
            hasRegistration (id) {
              return id === 'component:foo-bar-renderer'
            }
          }

          const renderers = []

          result = validator.validate(view, model, renderers, ownerMock)
        })

        it('returns proper result', () => {
          expect(result).deep.equal({
            errors: [],
            warnings: []
          })
        })
      })
    })
})
