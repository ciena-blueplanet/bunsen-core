var expect = require('chai').expect
var getDefaultView = require('../lib/generator').getDefaultView
var validator = require('../lib/validator')

var simpleModel = require('./fixtures/simple-model')
var simpleView = require('./fixtures/simple-view-2')
var arrayModel = require('./fixtures/array-model')
var arrayView = require('./fixtures/array-view-2')
var dependenciesModel = require('./fixtures/dependencies-model')
var dependenciesView = require('./fixtures/dependencies-view')

describe('generator', function () {
  describe('getDefaultView()', function () {
    var result
    describe('simple schema', function () {
      beforeEach(() => {
        result = getDefaultView(simpleModel)
      })

      it('creates proper simple layout', function () {
        expect(result).deep.equal(simpleView)
      })
    })

    describe('array schema', function () {
      beforeEach(() => {
        result = getDefaultView(arrayModel)
      })

      it('creates proper array layout', function () {
        expect(result).deep.equal(arrayView)
      })
    })

    describe('dependencies schema', function () {
      beforeEach(() => {
        result = getDefaultView(dependenciesModel)
      })

      it('creates proper dependencies layout', function () {
        expect(result).deep.equal(dependenciesView)
      })
    })

    describe('duplicate nested property names', function () {
      var model, view

      beforeEach(function () {
        model = {
          properties: {
            alpha: {
              properties: {
                foo: {
                  properties: {
                    bar: {
                      type: 'string'
                    }
                  },
                  type: 'object'
                }
              },
              type: 'object'
            },
            bravo: {
              properties: {
                foo: {
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

        view = getDefaultView(model)
      })

      it('generates valid view view', function () {
        const renderers = []

        function validateRenderer (rendererName) {
          return true
        }

        function validateModelType () {
          return false
        }

        result = validator.validate(view, model, renderers, validateRenderer, validateModelType)

        expect(result).deep.equal({
          errors: [],
          warnings: []
        })
      })
    })
  })
})
