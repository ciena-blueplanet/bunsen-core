/**
 * Unit tests for the utils/conditionals module
 */

var expect = require('chai').expect
var evaluate = require('../lib/evaluate-conditions')
var evaluateView = require('../lib/view-conditions')
var conditionUtils = require('../lib/utils/conditionals')
var addConditions = conditionUtils.addConditions

describe('addConditions', function () {
  addConditions({
    isThreeBiggerThan: (value, expected) => value === expected + 3
  })
  it('adds conditions that can be used in bunsen models', function () {
    var value = {
      foo: 6
    }
    var model = {
      type: 'object',
      properties: {
        foo: {
          type: 'integer'
        },
        bar: {
          type: 'integer',
          conditions: [{
            if: [{
              foo: {isThreeBiggerThan: 3}
            }]
          }]
        },
        baz: {
          type: 'integer',
          conditions: [{
            if: [{
              foo: {isThreeBiggerThan: 4}
            }]
          }]
        }
      }
    }
    expect(evaluate(model, value)).to.be.eql({
      type: 'object',
      properties: {
        foo: {
          type: 'integer'
        },
        bar: {
          type: 'integer'
        }
      }
    })
  })

  it('adds conditions that can be used in bunsen views', function () {
    var value = {
      foo: 6
    }
    var view = {
      version: '2.0',
      type: 'form',
      cells: [{
        label: 'Main',
        children: [{
          model: 'bar',
          conditions: [{
            if: [{
              foo: {isThreeBiggerThan: 4}
            }]
          }]
        }, {
          model: 'baz',
          conditions: [{
            if: [{
              foo: {isThreeBiggerThan: 3}
            }]
          }]
        }]
      }]
    }
    expect(evaluateView(view, value)).to.be.eql({
      version: '2.0',
      type: 'form',
      cells: [
        {
          label: 'Main',
          children: [{
            model: 'baz'
          }]
        }
      ]
    })
  })
})
