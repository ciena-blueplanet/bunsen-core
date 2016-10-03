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
})
