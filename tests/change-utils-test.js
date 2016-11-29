var changeUtils = require('../lib/change-utils')
var sinon = require('sinon')
var expect = require('chai').expect

describe('change-utils', function () {
  var sandbox
  beforeEach(function () {
    sandbox = sinon.sandbox.create()
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('traverseObjectLeaf', function () {
    var iteratee
    beforeEach(function () {
      iteratee = sandbox.spy()
      changeUtils.traverseObjectLeaf({
        foo: {
          bar: 'baz'
        },
        lorem: 'ipsum'
      }, iteratee)
    })

    it('calls iteratee on all the leaf values', function () {
      expect(iteratee.calledWith({
        value: 'baz',
        path: 'foo.bar'
      })).to.equal(true)
    })
  })

  describe('getChangeSet', function () {
    var oldValue, newValue
    beforeEach(function () {
      oldValue = {
        foo: {
          bar: 'baz'
        }
      }

      newValue = {
        foo: {
          bar: 'baz'
        }
      }
    })

    it('makes an entry for added items', function () {
      newValue['lorem'] = 'ipsum'
      var changeSet = changeUtils.getChangeSet(oldValue, newValue)
      expect(changeSet.get('lorem')).to.eql({
        value: 'ipsum',
        type: 'set'
      })
    })

    it('makes an entry for deleted items', function () {
      newValue['foo'] = {}
      var changeSet = changeUtils.getChangeSet(oldValue, newValue)
      expect(changeSet.get('foo.bar')).to.eql({
        value: 'baz',
        type: 'unset'
      })
    })

    it('makes an entry for updated items', function () {
      newValue['foo'] = {
        bar: 'foo'
      }
      var changeSet = changeUtils.getChangeSet(oldValue, newValue)
      expect(changeSet.get('foo.bar')).to.eql({
        value: 'foo',
        type: 'set'
      })
    })

    it('does not make entry for unchanged items', function () {
      var changeSet = changeUtils.getChangeSet(oldValue, newValue)
      expect(changeSet.size).to.equal(0)
    })
  })

  describe('computePatch', function () {
    describe('computes the right values for modified values', function () {
      it('when a leaf node is set to undefined', function () {
        const result = changeUtils.computePatch({
          foo: 'bar'
        }, {
          foo: undefined
        })
        expect(result).to.eql({
          foo: undefined
        })
      })

      it('when a parent node is set to undefined', function () {
        const result = changeUtils.computePatch({
          foo: {
            bar: 'baz'
          }
        }, {
          foo: undefined
        })

        expect(result).to.eql({
          foo: undefined
        })
      })

      it('when a parent node is set to an empty object', function () {
        const result = changeUtils.computePatch({
          foo: {
            bar: 'baz'
          }
        }, {
          foo: {}
        })

        expect(result).to.eql({
          foo: {}
        })
      })

      it('when a leaf node is updated', function () {
        const result = changeUtils.computePatch({
          foo: 'bar'
        }, {
          foo: 'baz'
        })
        expect(result).to.eql({
          foo: 'baz'
        })
      })

      it('when a parent node is updated', function () {
        const result = changeUtils.computePatch({
          foo: {
            bar: 'baz'
          }
        }, {
          foo: 'bar'
        })

        expect(result).to.eql({
          foo: 'bar'
        })
      })

      it('when an array item is modified', function () {
        const result = changeUtils.computePatch({
          foo: ['bar', 'baz']
        }, {
          foo: ['bar', 'qux']
        })

        expect(result).to.eql({
          foo: ['bar', 'qux']
        })
      })

      it('when a deeply nested array item is modified', function () {
        const result = changeUtils.computePatch({
          lorem: {
            fooParent: [{
              foo: ['bar', 'baz']
            }, {
              foo: ['bar', 'baz']
            }]
          },
          ipsum: 'dolor'
        }, {
          lorem: {
            fooParent: [{
              foo: ['bar', 'baz']
            }, {
              foo: ['bar', 'qux']
            }]
          },
          ipsum: 'dolor'
        })

        expect(result).to.eql({
          lorem: {
            fooParent: [{
              foo: ['bar', 'baz']
            }, {
              foo: ['bar', 'qux']
            }]
          }
        })
      })
    })

    describe('computes the right values for unmodified values', function () {
      it('when a leaf node is unmodified', function () {
        const result = changeUtils.computePatch({
          foo: 'bar'
        }, {
          foo: 'bar'
        })
        expect(result).to.eql({})
      })

      it('when an array is unmodified', function () {
        const result = changeUtils.computePatch({
          foo: ['bar', 'baz']
        }, {
          foo: ['bar', 'baz']
        })

        expect(result).to.eql({})
      })
    })

    describe('computes the right values for values that have been added', function () {
      it('when a leaf node is added', function () {
        const result = changeUtils.computePatch({
          foo: 'bar'
        }, {
          foo: 'bar',
          baz: 'qux'
        })
        expect(result).to.eql({
          baz: 'qux'
        })
      })

      it('when a parent node is updated with additions', function () {
        const result = changeUtils.computePatch({
          foo: {
            bar: 'baz'
          }
        }, {
          foo: {
            bar: 'baz',
            baz: 'qux'
          }
        })

        expect(result).to.eql({
          foo: {
            baz: 'qux'
          }
        })
      })

      it('when an array item is added to', function () {
        const result = changeUtils.computePatch({
          foo: ['bar', 'baz']
        }, {
          foo: ['bar', 'baz', 'qux']
        })

        expect(result).to.eql({
          foo: ['bar', 'baz', 'qux']
        })
      })

      it('when a nested array item is modified', function () {
        const result = changeUtils.computePatch({
          lorem: {
            fooParent: [{
              foo: ['bar', 'baz']
            }, {
              foo: ['bar', 'baz']
            }]
          },
          ipsum: 'dolor'
        }, {
          lorem: {
            fooParent: [{
              foo: ['bar', 'baz']
            }, {
              foo: ['bar', 'baz', 'qux']
            }]
          },
          ipsum: 'dolor'
        })

        expect(result).to.eql({
          lorem: {
            fooParent: [{
              foo: ['bar', 'baz']
            }, {
              foo: ['bar', 'baz', 'qux']
            }]
          }
        })
      })
    })
  })
})
