var expect = require('chai').expect
var actions = require('../../lib/actions')
var reducerExports = require('../../lib/reducer')
var reducer = reducerExports.reducer

function getInitialStateWithValue (value) {
  return {
    errors: {},
    validationResult: {warnings: [], errors: []},
    value,
    baseModel: {}
  }
}

function getStateWithValue (value) {
  return {
    errors: {},
    lastAction: 'CHANGE_VALUE',
    model: {},
    validationResult: {warnings: [], errors: []},
    value: value,
    baseModel: {},
    valueChangeSet: new Map()
  }
}

const tests = [
  {
    change: {
      bunsenId: null,
      value: {}
    },
    description: 'sets root object',
    initialValue: null,
    newValue: {}
  }
]

;[
  {type: 'boolean', initialValue: false, newValue: true},
  {type: 'integer', initialValue: 2, newValue: 1},
  {type: 'number', initialValue: 3.4, newValue: 1.5},
  {type: 'string', initialValue: 'baz', newValue: 'bar'}
]
  .forEach((test) => {
    tests.push(
      {
        change: {
          bunsenId: 'foo',
          value: test.newValue
        },
        description: `sets ${test.type} property`,
        initialValue: null,
        newValue: {
          foo: test.newValue
        }
      },
      {
        change: {
          bunsenId: 'foo',
          value: test.newValue
        },
        description: `updates ${test.type} property`,
        initialValue: {
          foo: test.initialValue
        },
        newValue: {
          foo: test.newValue
        }
      },
      {
        change: {
          bunsenId: 'foo',
          value: null
        },
        description: `unsets ${test.type} property`,
        initialValue: {
          foo: test.initialValue
        },
        newValue: {}
      },
      {
        change: {
          bunsenId: 'foo.0',
          value: test.newValue
        },
        description: `sets ${test.type} array item in non-present array`,
        initialValue: null,
        newValue: {
          foo: [test.newValue]
        }
      },
      {
        change: {
          bunsenId: 'foo.0',
          value: test.newValue
        },
        description: `sets ${test.type} array item in empty array`,
        initialValue: {
          foo: []
        },
        newValue: {
          foo: [test.newValue]
        }
      },
      {
        change: {
          bunsenId: 'foo.0',
          value: test.newValue
        },
        description: `updates ${test.type} array item in array`,
        initialValue: {
          foo: [test.initialValue]
        },
        newValue: {
          foo: [test.newValue]
        }
      },
      {
        change: {
          bunsenId: 'foo.1',
          value: test.newValue
        },
        description: `adds ${test.type} array item to array`,
        initialValue: {
          foo: [test.initialValue]
        },
        newValue: {
          foo: [test.initialValue, test.newValue]
        }
      },
      {
        change: {
          bunsenId: 'foo.0',
          value: test.newValue
        },
        description: `updates ${test.type} array item at beginning of array`,
        initialValue: {
          foo: [test.initialValue, test.initialValue, test.initialValue]
        },
        newValue: {
          foo: [test.newValue, test.initialValue, test.initialValue]
        }
      },
      {
        change: {
          bunsenId: 'foo.2',
          value: test.newValue
        },
        description: `updates ${test.type} array item at end of array`,
        initialValue: {
          foo: [test.initialValue, test.initialValue, test.initialValue]
        },
        newValue: {
          foo: [test.initialValue, test.initialValue, test.newValue]
        }
      },
      {
        change: {
          bunsenId: 'foo.1',
          value: test.newValue
        },
        description: `updates ${test.type} array item in middle of array`,
        initialValue: {
          foo: [test.initialValue, test.initialValue, test.initialValue]
        },
        newValue: {
          foo: [test.initialValue, test.newValue, test.initialValue]
        }
      }
    )
  })

describe('change value reducer', function () {
  tests.forEach((test) => {
    it(test.description, function () {
      const expected = getStateWithValue(test.newValue)
      const initialState = getInitialStateWithValue(test.initialValue)

      const actual = reducer(initialState, {
        bunsenId: test.change.bunsenId,
        type: actions.CHANGE_VALUE,
        value: test.change.value
      })

      expect(actual).to.eql(expected)
    })
  })
})
