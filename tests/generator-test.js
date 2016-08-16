var expect = require('chai').expect
var getDefaultView = require('../lib/generator').getDefaultView

var simpleModel = require('./fixtures/simple-model')
var simpleView = require('./fixtures/simple-view-2')
var arrayModel = require('./fixtures/array-model')
var arrayView = require('./fixtures/array-view-2')
var dependenciesModel = require('./fixtures/dependencies-model')
var dependenciesView = require('./fixtures/dependencies-view')

describe('generator', function () {
  describe('getDefaultView()', () => {
    var result
    describe('simple schema', () => {
      beforeEach(() => {
        result = getDefaultView(simpleModel)
      })

      it('creates proper simple layout', () => {
        expect(result).deep.equal(simpleView)
      })
    })

    describe('array schema', () => {
      beforeEach(() => {
        result = getDefaultView(arrayModel)
      })

      it('creates proper array layout', () => {
        expect(result).deep.equal(arrayView)
      })
    })

    describe('dependencies schema', () => {
      beforeEach(() => {
        result = getDefaultView(dependenciesModel)
      })

      it('creates proper dependencies layout', () => {
        expect(result).deep.equal(dependenciesView)
      })
    })
  })
})
