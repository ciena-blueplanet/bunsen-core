'use strict'

const expect = require('chai').expect
const utils = require('../lib/utils')

describe('utils', () => {
  describe('.getModelPath()', () => {
    it('handles top-level properties', () => {
      expect(utils.getModelPath('fooBar')).to.equal('properties.fooBar')
    })

    it('handles nested properties', () => {
      expect(utils.getModelPath('foo.bar.baz')).to.equal('properties.foo.properties.bar.properties.baz')
    })

    it('handles invalid trailing dot reference', () => {
      expect(utils.getModelPath('foo.bar.')).to.equal(undefined)
    })

    it('handles invalid leading dot reference', () => {
      expect(utils.getModelPath('.foo.bar')).to.equal(undefined)
    })

    it('handles model with dependency', () => {
      const expected = 'dependencies.useEft.properties.routingNumber'
      expect(utils.getModelPath('routingNumber', 'useEft')).to.equal(expected)
    })

    it('handles model with dependency', () => {
      const expected = 'properties.paymentInfo.dependencies.useEft.properties.routingNumber'
      expect(utils.getModelPath('paymentInfo.routingNumber', 'paymentInfo.useEft')).to.equal(expected)
    })

    it('handles properties on array items', () => {
      expect(utils.getModelPath('foo.bar.0.baz')).to.equal('properties.foo.properties.bar.items.properties.baz')
    })
  })

  describe('orch filter processing', () => {
    const objToMine = {
      foo: 'bar',
      fizz: {
        foo: 'bar',
        futz: [
          {
            foo: 'bar'
          },
          {
            fizz: 'buzz',
            farz: 'barz'
          }
        ],
        fatz: 'batz'
      }
    }

    it('finds absolute paths in a value object', () => {
      const expected = 'bar'
      expect(utils.findValue(objToMine, 'fizz.futz.[0].foo')).to.equal(expected)
    })

    it('finds parent paths in the object', () => {
      const startPath = 'fizz.futz.[1].fizz'
      let valuePath = '../../fatz'
      let expected = 'batz'
      expect(utils.findValue(objToMine, valuePath, startPath)).to.equal(expected)
      valuePath = '../[0].foo'
      expected = 'bar'
      expect(utils.findValue(objToMine, valuePath, startPath)).to.equal(expected)
    })

    it('finds sibling paths in the object', () => {
      const startPath = 'fizz.futz.[1].fizz'
      const valuePath = './farz'
      const expected = 'barz'
      expect(utils.findValue(objToMine, valuePath, startPath)).to.equal(expected)
    })

    it('populates variables in orch-style query params ', () => {
      let query = {something: '${fizz.futz[0].foo}'}
      const expected = '{"something":"bar"}'
      expect(utils.parseVariables(objToMine, JSON.stringify(query))).to.equal(expected)
    })

    it('properly configures an Orchestrate query object', () => {
      let startPath = 'fizz.futz.[0].foo'
      let query = {
        resourceType: 'something.this.that',
        q: 'label:thing,someId:${../[1].fizz}',
        p: 'orchState:ac,someOtherId:${foo}'
      }
      let expected = {
        resourceType: 'something.this.that',
        q: 'label:thing,someId:buzz',
        p: 'orchState:ac,someOtherId:bar'
      }
      let actual = utils.populateQuery(objToMine, query, startPath)
      expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected))
    })
  })

  describe('.parseVariables()', function () {
    it('returns an empty string when queryJSON not present', function () {
      expect(utils.parseVariables({}, undefined)).to.equal('')
    })
  })

  describe('.populateQuery()', function () {
    it('does not throw error when query not present', function () {
      expect(() => {
        utils.populateQuery({}, undefined)
      }).not.to.throw()
    })

    it('does not return null when query is not present', function () {
      expect(utils.populateQuery({}, undefined)).not.to.equal(null)
    })

    it('does not return null when query is empty', function () {
      expect(utils.populateQuery({}, {})).not.to.equal(null)
    })

    it('does not throw error when query dependency is not present', function () {
      expect(function () {
        utils.populateQuery({}, {node: '${./node}'})
      }).not.to.throw()
    })

    it('returns null when query dependency is not present', function () {
      expect(utils.populateQuery({}, {node: '${./node}'})).to.equal(null)
    })
  })
})
