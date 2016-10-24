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
    },
    {
      containers: [
        {
          id: 'main',
          rows: [
            [
              {
                model: 'foo'
              }
            ]
          ]
        }
      ],
      rootContainers: [
        {
          container: 'main',
          label: 'Main'
        }
      ],
      type: 'form',
      version: '1.0'
    }
  ]
    .forEach((view) => {
      describe('when valid', function () {
        var result

        beforeEach(function () {
          const model = {
            properties: {
              foo: {
                type: 'string'
              }
            },
            type: 'object'
          }

          const renderers = []

          function validateRenderer (rendererName) {
            return rendererName === 'foo-bar-renderer'
          }

          function validateModelType () {
            return true
          }

          result = validator.validate(view, model, renderers, validateRenderer, validateModelType)
        })

        it('returns proper result', function () {
          expect(result).deep.equal({
            errors: [],
            warnings: []
          })
        })
      })
    })

  describe('when valid', function () {
    var result

    beforeEach(function () {
      const model = {
        type: 'object',
        properties: {
          nested: {
            type: 'object',
            properties: {
              foo: {
                type: 'object',
                properties: {
                  foosValue: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }

      const view = {
        type: 'form',
        version: '2.0',
        cells: [
          {
            children: [
              {
                label: 'Main',
                model: 'nested',
                children: [
                  {
                    label: 'Foo',
                    model: 'foo',
                    children: [
                      {
                        label: 'value',
                        model: 'foosValue'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }

      const renderers = []

      function validateRenderer (rendererName) {
        return rendererName === 'foo-bar-renderer'
      }

      function validateModelType () {
        return true
      }

      result = validator.validate(view, model, renderers, validateRenderer, validateModelType)
    })

    it('returns proper result', function () {
      expect(result).deep.equal({
        errors: [],
        warnings: []
      })
    })
  })

  describe('when valid', function () {
    var result

    beforeEach(function () {
      const model = {
        properties: {
          alpha: {
            properties: {
              foo: {
                type: 'string'
              }
            },
            type: 'object'
          },
          bravo: {
            properties: {
              foo: {
                type: 'string'
              }
            },
            type: 'object'
          }
        },
        type: 'object'
      }

      const view = {
        version: '2.0',
        type: 'form',
        cells: [
          {
            extends: 'foo',
            model: 'alpha'
          },
          {
            extends: 'foo',
            model: 'bravo'
          }
        ],
        cellDefinitions: {
          foo: {
            children: [
              {
                model: 'foo'
              }
            ]
          }
        }
      }

      const renderers = []

      function validateRenderer (rendererName) {
        return rendererName === 'foo-bar-renderer'
      }

      function validateModelType () {
        return true
      }

      result = validator.validate(view, model, renderers, validateRenderer, validateModelType)
    })

    it('returns proper result', function () {
      expect(result).deep.equal({
        errors: [],
        warnings: []
      })
    })
  })

  describe('when valid', function () {
    var result

    beforeEach(function () {
      const model = {
        properties: {
          foo: {
            properties: {
              bar: {
                properties: {
                  baz: {
                    type: 'string'
                  }
                },
                type: 'object'
              }
            },
            type: 'object'
          }
        },
        type: 'object'
      }

      const view = {
        cells: [
          {
            children: [
              {
                model: 'baz'
              }
            ],
            model: 'foo.bar'
          }
        ],
        type: 'form',
        version: '2.0'
      }

      const renderers = []

      function validateRenderer (rendererName) {
        return rendererName === 'foo-bar-renderer'
      }

      function validateModelType () {
        return true
      }

      result = validator.validate(view, model, renderers, validateRenderer, validateModelType)
    })

    it('returns proper result', function () {
      expect(result).deep.equal({
        errors: [],
        warnings: []
      })
    })
  })

  describe('when modelType is invalid on root cell', function () {
    var result

    beforeEach(function () {
      const model = {
        properties: {
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      }

      const view = {
        cells: [
          {
            model: 'foo',
            renderer: {
              name: 'select',
              options: {
                modelType: 'bar'
              }
            }
          }
        ],
        type: 'form',
        version: '2.0'
      }

      const renderers = []

      function validateRenderer (rendererName) {
        return true
      }

      function validateModelType () {
        return false
      }

      result = validator.validate(view, model, renderers, validateRenderer, validateModelType)
    })

    it('returns proper result', () => {
      expect(result).deep.equal({
        errors: [
          {
            message: 'Invalid modelType reference "bar"',
            path: '#/cells/0/renderer/options'
          }
        ],
        warnings: []
      })
    })
  })

  describe('when modelType is invalid on root cell child', function () {
    var result

    beforeEach(function () {
      const model = {
        properties: {
          foo: {
            type: 'string'
          }
        },
        type: 'object'
      }

      const view = {
        cells: [
          {
            children: [
              {
                model: 'foo',
                renderer: {
                  name: 'select',
                  options: {
                    modelType: 'bar'
                  }
                }
              }
            ]
          }
        ],
        type: 'form',
        version: '2.0'
      }

      const renderers = []

      function validateRenderer (rendererName) {
        return true
      }

      function validateModelType () {
        return false
      }

      result = validator.validate(view, model, renderers, validateRenderer, validateModelType)
    })

    it('returns proper result', () => {
      expect(result).deep.equal({
        errors: [
          {
            message: 'Invalid modelType reference "bar"',
            path: '#/cells/0/children/0/renderer/options'
          }
        ],
        warnings: []
      })
    })
  })
})
