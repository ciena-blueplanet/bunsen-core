var expect = require('chai').expect
var actions = require('../../lib/actions')
var reducer = require('../../lib/reducer').reducer

describe('reducer: CHANGE_MODEL', function () {
  let initialState
  beforeEach(function () {
    initialState = {
      baseModel: {
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {type: 'object'}
                }
              }
            }
          }
        }
      },
      unnormalizedView: {
        type: 'form',
        version: '2.0',
        cells: [{
          model: 'foo.bar.baz'
        }]
      }
    }
  })

  describe('when model does not include references', function () {
    let newState
    beforeEach(function () {
      newState = reducer(initialState, {
        type: actions.CHANGE_MODEL,
        model: initialState.baseModel
      })
    })

    it('returns the new model', function () {
      expect(newState.model).to.eql(initialState.baseModel)
    })
  })

  describe('when model includes complex references', function () {
    let newState
    beforeEach(function () {
      newState = reducer(initialState, {
        type: actions.CHANGE_MODEL,
        model: {
          type: 'object',
          definitions: {
            barbaz: {
              type: 'object',
              properties: {
                bar: {
                  type: 'object',
                  properties: {
                    baz: {type: 'string'}
                  }
                }
              }
            }
          },
          properties: {
            foo: {
              type: 'object',
              '$ref': '#/definitions/barbaz'
            }
          }
        }
      })
    })

    it('returns the new model fully expanded', function () {
      expect(newState.model).to.eql({
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {type: 'string'}
                }
              }
            }
          }
        }
      })
    })
  })
})
