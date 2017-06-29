/**
 * Unit tests for the utils/conditionals module
 */

var expect = require('chai').expect
var evaluate = require('../lib/evaluate-conditions')
var evaluateView = require('../lib/view-conditions')
var conditionUtils = require('../lib/utils/conditionals')
var addConditions = conditionUtils.addConditions
var meetsCondition = conditionUtils.meetsCondition

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

describe('meetsConditions', function () {
  describe('evaluates a value against a condition', function () {
    var condition
    beforeEach(function () {
      condition = {equals: 1}
    })

    it('and it returns true when the condition is satisfied', function () {
      expect(meetsCondition(1, condition)).to.equal(true)
    })
    it('and it returns false when the condition is not satisfied', function () {
      expect(meetsCondition(2, condition)).to.equal(false)
    })
  })

  describe('by default can evaluate the conditons:', function () {
    const borrowedConditions = {
      equals: {
        expectedValue: 5,
        matchingValue: 5
      },
      notEqual: {
        expectedValue: 5,
        matchingValue: 1
      },
      isDefined: {
        expectedValue: true,
        matchingValue: 1
      },
      isUndefined: {
        expectedValue: true
      },
      isNull: {
        expectedValue: true,
        matchingValue: null
      },
      isNotNull: {
        expectedValue: true,
        matchingValue: 'anything but null'
      },
      isNil: {
        expectedValue: true,
        matchingValue: null
      },
      isNotNil: {
        expectedValue: true,
        matchingValue: 'anything but null or undefined'
      },
      isNaN: {
        expectedValue: true,
        matchingValue: NaN
      }
    }

    Object.keys(borrowedConditions).forEach(function (name) {
      it(name, function () {
        const expectedValue = borrowedConditions[name].expectedValue
        const matchingValue = borrowedConditions[name].matchingValue
        const condition = {}
        condition[name] = expectedValue
        expect(meetsCondition(matchingValue, condition), 'returns true for matching value').to.equal(true)
      })
    })

    const customConditions = {
      greaterThan: {
        expectedValue: 5,
        matchingValue: 8,
        nonMatchingValue: 2
      },
      lessThan: {
        expectedValue: 5,
        matchingValue: 2,
        nonMatchingValue: 8
      },
      hasLength: {
        expectedValue: 5,
        matchingValue: 'toast',
        nonMatchingValue: 'no'
      },
      isLongerThan: {
        expectedValue: 4,
        matchingValue: 'toast',
        nonMatchingValue: 'loot'
      },
      isShorterThan: {
        expectedValue: 4,
        matchingValue: 'no',
        nonMatchingValue: 'loot'
      },
      matchesRegExp: {
        expectedValue: 'test',
        matchingValue: 'testament',
        nonMatchingValue: 'ticks'
      }
    }
    Object.keys(customConditions).forEach(function (name) {
      it(name, function () {
        const expectedValue = customConditions[name].expectedValue
        const matchingValue = customConditions[name].matchingValue
        const nonMatchingValue = customConditions[name].nonMatchingValue
        const condition = {}
        condition[name] = expectedValue
        expect(meetsCondition(matchingValue, condition), 'returns true for matching value').to.equal(true)
        expect(meetsCondition(nonMatchingValue, condition), 'returns false for non-matching value').to.equal(false)
      })
    })
  })
})
