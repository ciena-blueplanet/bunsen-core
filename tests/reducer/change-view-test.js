var expect = require('chai').expect
var actions = require('../../lib/actions')
var reducer = require('../../lib/reducer').reducer

describe('reducer: CHANGE_VIEW', function () {
  var initialState, baseModel
  beforeEach(function () {
    baseModel = {
      type: 'object',
      properties: {
        foo: {
          type: 'object'
        }
      }
    }
    initialState = {
      baseModel,
      unnormalizedModel: baseModel
    }
  })

  describe('when view containers internal models', function () {
    var newState
    beforeEach(function () {
      newState = reducer(initialState, {
        type: actions.CHANGE_VIEW,
        view: {
          type: 'form',
          version: '2.0',
          cells: [{
            id: 'bar',
            model: {
              type: 'string'
            },
            internal: true
          }]
        }
      })
    })

    it('should return the view', function () {
      expect(newState.view).to.eql({
        type: 'form',
        version: '2.0',
        cells: [{
          id: 'bar',
          internal: true,
          model: '_internal.bar'
        }]
      })
    })

    it('should update the model', function () {
      expect(newState.model).to.eql({
        type: 'object',
        properties: {
          foo: {
            type: 'object'
          },
          _internal: {
            type: 'object',
            properties: {
              bar: {
                type: 'string'
              }
            }
          }
        }
      })
    })
  })
})
