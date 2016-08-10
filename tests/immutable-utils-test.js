var expect = require('chai').expect
var immutable = require('seamless-immutable')
var immutableHelpers = require('../lib/immutable-utils')
var unset = immutableHelpers.unset

/**
 * Check if two immutable objects are the same
 * @param {Immutable} actual - first object
 * @param {Immutable} expected - second object
 */
function expectEquals (actual, expected) {
  if ('asMutable' in actual) {
    actual = actual.asMutable()
  }

  expect(actual).to.eql(expected)
}

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
    expectEquals(actual, {})
  })

  it('integer', function () {
    const obj = immutable({
      foo: 1
    })
    const actual = unset(obj, 'foo')
    expectEquals(actual, {})
  })

  it('number', function () {
    const obj = immutable({
      foo: 1.5
    })
    const actual = unset(obj, 'foo')
    expectEquals(actual, {})
  })

  it('string', function () {
    const obj = immutable({
      foo: 'a'
    })
    const actual = unset(obj, 'foo')
    expectEquals(actual, {})
  })

  it('boolean within object', function () {
    const obj = immutable({
      foo: {
        bar: true
      }
    })
    const actual = unset(obj, 'foo.bar')
    expectEquals(actual, {foo: {}})
  })

  it('integer within object', function () {
    const obj = immutable({
      foo: {
        bar: 1
      }
    })
    const actual = unset(obj, 'foo.bar')
    expectEquals(actual, {foo: {}})
  })

  it('number within object', function () {
    const obj = immutable({
      foo: {
        bar: 1.5
      }
    })
    const actual = unset(obj, 'foo.bar')
    expectEquals(actual, {foo: {}})
  })

  it('string within object', function () {
    const obj = immutable({
      foo: {
        bar: 'a'
      }
    })
    const actual = unset(obj, 'foo.bar')
    expectEquals(actual, {foo: {}})
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
      expectEquals(actual, {foo: [false, true]})
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.1')
      expectEquals(actual, {foo: [true, true]})
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.2')
      expectEquals(actual, {foo: [true, false]})
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo')
      expectEquals(actual, {})
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
      expectEquals(actual, {foo: [2, 3]})
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.1')
      expectEquals(actual, {foo: [1, 3]})
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.2')
      expectEquals(actual, {foo: [1, 2]})
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo')
      expectEquals(actual, {})
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
      expectEquals(actual, {foo: [2.5, 3.5]})
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.1')
      expectEquals(actual, {foo: [1.5, 3.5]})
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.2')
      expectEquals(actual, {foo: [1.5, 2.5]})
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo')
      expectEquals(actual, {})
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
      expectEquals(actual, {foo: ['b', 'c']})
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.1')
      expectEquals(actual, {foo: ['a', 'c']})
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.2')
      expectEquals(actual, {foo: ['a', 'b']})
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo')
      expectEquals(actual, {})
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
      expectEquals(actual, {
        foo: [
          [false, true]
        ]
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.0.1')
      expectEquals(actual, {
        foo: [
          [true, true]
        ]
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.0.2')
      expectEquals(actual, {
        foo: [
          [true, false]
        ]
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.0')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: [
          [2, 3]
        ]
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.0.1')
      expectEquals(actual, {
        foo: [
          [1, 3]
        ]
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.0.2')
      expectEquals(actual, {
        foo: [
          [1, 2]
        ]
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.0')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: [
          [2.5, 3.5]
        ]
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.0.1')
      expectEquals(actual, {
        foo: [
          [1.5, 3.5]
        ]
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.0.2')
      expectEquals(actual, {
        foo: [
          [1.5, 2.5]
        ]
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.0')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: [
          ['b', 'c']
        ]
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.0.1')
      expectEquals(actual, {
        foo: [
          ['a', 'c']
        ]
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.0.2')
      expectEquals(actual, {
        foo: [
          ['a', 'b']
        ]
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.0')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: {
          bar: [false, true]
        }
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.bar.1')
      expectEquals(actual, {
        foo: {
          bar: [true, true]
        }
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.bar.2')
      expectEquals(actual, {
        foo: {
          bar: [true, false]
        }
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.bar')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: {
          bar: [2, 3]
        }
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.bar.1')
      expectEquals(actual, {
        foo: {
          bar: [1, 3]
        }
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.bar.2')
      expectEquals(actual, {
        foo: {
          bar: [1, 2]
        }
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.bar')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: {
          bar: [2.5, 3.5]
        }
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.bar.1')
      expectEquals(actual, {
        foo: {
          bar: [1.5, 3.5]
        }
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.bar.2')
      expectEquals(actual, {
        foo: {
          bar: [1.5, 2.5]
        }
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.bar')
      expectEquals(actual, {
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
      expectEquals(actual, {
        foo: {
          bar: ['b', 'c']
        }
      })
    })

    it('middle item', function () {
      const actual = unset(obj, 'foo.bar.1')
      expectEquals(actual, {
        foo: {
          bar: ['a', 'c']
        }
      })
    })

    it('last item', function () {
      const actual = unset(obj, 'foo.bar.2')
      expectEquals(actual, {
        foo: {
          bar: ['a', 'b']
        }
      })
    })

    it('entire array', function () {
      const actual = unset(obj, 'foo.bar')
      expectEquals(actual, {
        foo: {}
      })
    })
  })
})
