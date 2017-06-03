'use strict'

const expect = require('chai').expect
const pathUtils = require('../../../lib/utils/path')
const ValueWrapper = pathUtils.ValueWrapper

describe('utils/path', () => {
  describe('ValueWrapper class', () => {
    var wrapper
    beforeEach(function () {
      wrapper = new ValueWrapper({
        foo: {
          bar1: {
            baz: {
              quux: 'test 1',
              must: {
                go: {
                  deeper: true
                }
              }
            }
          },
          bar2: {
            baz: {
              quux: 'test 2'
            }
          }
        }
      }, 'foo.bar1.baz')
    })

    it('keeps track of a value within a larger object', function () {
      expect(wrapper.get()).to.eql({
        quux: 'test 1',
        must: {
          go: {
            deeper: true
          }
        }
      })
    })
    describe('get method', function () {
      it('gets properties from a path in the base object', function () {
        expect(wrapper.get('foo.bar1.baz.quux')).to.eql('test 1')
      })
      it('can handle relative paths', function () {
        expect(wrapper.get('./baz.quux')).to.eql('test 1')
        expect(wrapper.get('../bar2.baz.quux')).to.eql('test 2')
        var newWrapper = wrapper.pushPath('must.go.deeper')

        expect(newWrapper.get('../../quux')).to.eql('test 1')
      })
    })
    describe('pushPath method', function () {
      var newWrapper
      beforeEach(function () {
        newWrapper = wrapper.pushPath('must.go.deeper')
      })
      it('appends to the contained path', function () {
        expect(newWrapper.get()).to.eql(true)
      })
      it('returns a new object', function () {
        expect(newWrapper).to.not.equal(wrapper)
      })
    })
  })
})
