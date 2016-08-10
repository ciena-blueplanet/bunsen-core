var expect = require('chai').expect
var reducerExports = require('../lib/reducer')
var actions = require('../lib/actions')
var immutable = require('seamless-immutable')
var reducer = reducerExports.reducer
var unset = reducerExports.unset

function expectImmutable (actual, expected) {
  if ('asMutable' in actual) {
    actual = actual.asMutable()
  }

  expect(actual).to.eql(expected)
}

describe('reducer', function () {
  describe('initial state', function () {
    it('should be what we want', function () {
      var initialState = reducer({}, {type: '@@redux/INIT'})

      expect(initialState.errors).to.eql({})
      expect(initialState.validationResult).to.eql({warnings: [], errors: []})
      expect(initialState.value).to.eql(null)
    })
  })

  describe('value manipulation', function () {
    it('can change a value', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: 12,
          bar: {
            qux: 'cheese'
          }
        },
        baseModel: {}
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: 'wine', bunsenId: 'bar.qux'})
      expect(changedState.value.bar.qux).to.eql('wine')
      expect(changedState.value.foo).to.eql(12)
    })

    it('can remove a value', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: 12,
          bar: {
            qux: 'cheese'
          }
        },
        baseModel: {}
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: '', bunsenId: 'bar.qux'})
      expect(changedState.value).to.eql({foo: 12, bar: {}})
    })

    it('can set the entire value', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: {
          foo: 12,
          bar: {
            qux: 'cheese'
          }
        },
        baseModel: {}
      }
      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: {baz: 22}, bunsenId: null})
      expect(changedState.value).to.eql({baz: 22})
    })

    it('will prune all the dead wood when setting root object', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: null,
        baseModel: {}
      }
      var newValue = {
        foo: {
          bar: {
            baz: null,
            qux: 12
          },
          waldo: null,
          buzz: true,
          fizz: false
        }
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: newValue, bunsenId: null})
      expect(changedState.value).to.eql({foo: {bar: {qux: 12}, buzz: true, fizz: false}})
    })

    it('will prune all the dead wood out of a complex array', function () {
      var initialState = {
        errors: {},
        validationResult: {warnings: [], errors: []},
        value: null,
        baseModel: {}
      }
      var newValue = {
        a: {
          b1: [
            {c1: {
              d: null
            }},
            {c2: 12},
            {c3: [1, 2, 3]}
          ],
          b2: []
        }
      }

      var changedState = reducer(initialState, {type: actions.CHANGE_VALUE, value: newValue, bunsenId: null})
      expect(changedState.value).to.eql({a: {b1: [{c1: {}}, {c2: 12}, {c3: [1, 2, 3]}]}})
    })
  })

  describe('can set the validation', function () {
    it('basic functionality', function () {
      var initialState = {
        errors: ['this is broken'],
        validationResult: ['this sucks'],
        value: {},
        baseModel: {}
      }
      var changedState = reducer(initialState, {
        type: actions.VALIDATION_RESOLVED, errors: [], validationResult: ['you look kinda fat']
      })

      expect(changedState).to.eql({
        errors: [],
        validationResult: ['you look kinda fat'],
        value: {},
        baseModel: {}
      })
    })
  })

  describe('unset', function () {
    it('throws error when trying to unset path on a boolean', function () {
      expect(() => {
        unset(true, 'foo')
      }).to.throw('A path can only be unset for objects and arrays not boolean')
    })

    it('throws error when trying to unset path on an integer', function () {
      expect(() => {
        unset(1, 'foo')
      }).to.throw('A path can only be unset for objects and arrays not number')
    })

    it('throws error when trying to unset path on a number', function () {
      expect(() => {
        unset(1.5, 'foo')
      }).to.throw('A path can only be unset for objects and arrays not number')
    })

    it('throws error when trying to unset path on null', function () {
      expect(() => {
        unset(null, 'foo')
      }).to.throw('A path can only be unset for objects and arrays not null')
    })

    it('throws error when trying to unset path on a string', function () {
      expect(() => {
        unset('test', 'foo')
      }).to.throw('A path can only be unset for objects and arrays not string')
    })

    it('throws error when trying to unset path on undefined', function () {
      expect(() => {
        unset(undefined, 'foo')
      }).to.throw('A path can only be unset for objects and arrays not undefined')
    })

    it('boolean', function () {
      const obj = immutable({
        foo: true
      })
      const actual = unset(obj, 'foo')
      expectImmutable(actual, {})
    })

    it('integer', function () {
      const obj = immutable({
        foo: 1
      })
      const actual = unset(obj, 'foo')
      expectImmutable(actual, {})
    })

    it('number', function () {
      const obj = immutable({
        foo: 1.5
      })
      const actual = unset(obj, 'foo')
      expectImmutable(actual, {})
    })

    it('string', function () {
      const obj = immutable({
        foo: 'a'
      })
      const actual = unset(obj, 'foo')
      expectImmutable(actual, {})
    })

    it('boolean within object', function () {
      const obj = immutable({
        foo: {
          bar: true
        }
      })
      const actual = unset(obj, 'foo.bar')
      expectImmutable(actual, {foo: {}})
    })

    it('integer within object', function () {
      const obj = immutable({
        foo: {
          bar: 1
        }
      })
      const actual = unset(obj, 'foo.bar')
      expectImmutable(actual, {foo: {}})
    })

    it('number within object', function () {
      const obj = immutable({
        foo: {
          bar: 1.5
        }
      })
      const actual = unset(obj, 'foo.bar')
      expectImmutable(actual, {foo: {}})
    })

    it('string within object', function () {
      const obj = immutable({
        foo: {
          bar: 'a'
        }
      })
      const actual = unset(obj, 'foo.bar')
      expectImmutable(actual, {foo: {}})
    })

    describe('boolean array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [true, false, true]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {foo: [false, true]})
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.1')
        expectImmutable(actual, {foo: [true, true]})
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.2')
        expectImmutable(actual, {foo: [true, false]})
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo')
        expectImmutable(actual, {})
      })
    })

    describe('integer array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [1, 2, 3]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {foo: [2, 3]})
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.1')
        expectImmutable(actual, {foo: [1, 3]})
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.2')
        expectImmutable(actual, {foo: [1, 2]})
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo')
        expectImmutable(actual, {})
      })
    })

    describe('number array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [1.5, 2.5, 3.5]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {foo: [2.5, 3.5]})
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.1')
        expectImmutable(actual, {foo: [1.5, 3.5]})
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.2')
        expectImmutable(actual, {foo: [1.5, 2.5]})
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo')
        expectImmutable(actual, {})
      })
    })

    describe('string array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: ['a', 'b', 'c']
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {foo: ['b', 'c']})
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.1')
        expectImmutable(actual, {foo: ['a', 'c']})
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.2')
        expectImmutable(actual, {foo: ['a', 'b']})
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo')
        expectImmutable(actual, {})
      })
    })

    describe('boolean array within array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [
            [true, false, true]
          ]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0.0')
        expectImmutable(actual, {
          foo: [
            [false, true]
          ]
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.0.1')
        expectImmutable(actual, {
          foo: [
            [true, true]
          ]
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.0.2')
        expectImmutable(actual, {
          foo: [
            [true, false]
          ]
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {
          foo: []
        })
      })
    })

    describe('integer array within array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [
            [1, 2, 3]
          ]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0.0')
        expectImmutable(actual, {
          foo: [
            [2, 3]
          ]
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.0.1')
        expectImmutable(actual, {
          foo: [
            [1, 3]
          ]
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.0.2')
        expectImmutable(actual, {
          foo: [
            [1, 2]
          ]
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {
          foo: []
        })
      })
    })

    describe('number array within array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [
            [1.5, 2.5, 3.5]
          ]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0.0')
        expectImmutable(actual, {
          foo: [
            [2.5, 3.5]
          ]
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.0.1')
        expectImmutable(actual, {
          foo: [
            [1.5, 3.5]
          ]
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.0.2')
        expectImmutable(actual, {
          foo: [
            [1.5, 2.5]
          ]
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {
          foo: []
        })
      })
    })

    describe('string array within array', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: [
            ['a', 'b', 'c']
          ]
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.0.0')
        expectImmutable(actual, {
          foo: [
            ['b', 'c']
          ]
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.0.1')
        expectImmutable(actual, {
          foo: [
            ['a', 'c']
          ]
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.0.2')
        expectImmutable(actual, {
          foo: [
            ['a', 'b']
          ]
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.0')
        expectImmutable(actual, {
          foo: []
        })
      })
    })

    describe('boolean array within object', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: {
            bar: [true, false, true]
          }
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.bar.0')
        expectImmutable(actual, {
          foo: {
            bar: [false, true]
          }
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.bar.1')
        expectImmutable(actual, {
          foo: {
            bar: [true, true]
          }
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.bar.2')
        expectImmutable(actual, {
          foo: {
            bar: [true, false]
          }
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.bar')
        expectImmutable(actual, {
          foo: {}
        })
      })
    })

    describe('integer array within object', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: {
            bar: [1, 2, 3]
          }
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.bar.0')
        expectImmutable(actual, {
          foo: {
            bar: [2, 3]
          }
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.bar.1')
        expectImmutable(actual, {
          foo: {
            bar: [1, 3]
          }
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.bar.2')
        expectImmutable(actual, {
          foo: {
            bar: [1, 2]
          }
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.bar')
        expectImmutable(actual, {
          foo: {}
        })
      })
    })

    describe('number array within object', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: {
            bar: [1.5, 2.5, 3.5]
          }
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.bar.0')
        expectImmutable(actual, {
          foo: {
            bar: [2.5, 3.5]
          }
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.bar.1')
        expectImmutable(actual, {
          foo: {
            bar: [1.5, 3.5]
          }
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.bar.2')
        expectImmutable(actual, {
          foo: {
            bar: [1.5, 2.5]
          }
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.bar')
        expectImmutable(actual, {
          foo: {}
        })
      })
    })

    describe('string array within object', function () {
      var obj

      beforeEach(function () {
        obj = immutable({
          foo: {
            bar: ['a', 'b', 'c']
          }
        })
      })

      it('first item', function () {
        const actual = unset(obj, 'foo.bar.0')
        expectImmutable(actual, {
          foo: {
            bar: ['b', 'c']
          }
        })
      })

      it('middle item', function () {
        const actual = unset(obj, 'foo.bar.1')
        expectImmutable(actual, {
          foo: {
            bar: ['a', 'c']
          }
        })
      })

      it('last item', function () {
        const actual = unset(obj, 'foo.bar.2')
        expectImmutable(actual, {
          foo: {
            bar: ['a', 'b']
          }
        })
      })

      it('entire array', function () {
        const actual = unset(obj, 'foo.bar')
        expectImmutable(actual, {
          foo: {}
        })
      })
    })
  })
})
