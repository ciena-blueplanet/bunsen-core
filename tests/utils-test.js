'use strict'

const expect = require('chai').expect
const utils = require('../lib/utils')
const dependenciesModel = require('./fixtures/dependencies-model.js')

describe('utils', () => {
  describe('.getModelPath()', () => {
    it('is not yet implemented', function () {
      expect(true).to.be.false()
    })
  })
  describe('._getModelPath()', () => {
    it('handles top-level properties', () => {
      expect(utils._getModelPath('fooBar')).to.eql(['fooBar'])
    })

    it('handles nested properties', () => {
      const expected = ['foo', 'bar', 'baz']
      expect(utils._getModelPath('foo.bar.baz')).to.eql(expected)
    })

    it('handles invalid trailing dot reference', () => {
      expect(utils._getModelPath('foo.bar.')).to.eql(undefined)
    })

    it('handles invalid leading dot reference', () => {
      expect(utils._getModelPath('.foo.bar')).to.eql(undefined)
    })

    it('handles model with dependency', () => {
      const expected = ['$dependencies', 'useEft', 'routingNumber']
      expect(utils._getModelPath('routingNumber', 'useEft')).to.eql(expected)
    })

    it('handles model with dependency', () => {
      const expected = ['paymentInfo', '$dependencies', 'useEft', 'routingNumber']
      expect(utils._getModelPath('paymentInfo.routingNumber', 'paymentInfo.useEft')).to.eql(expected)
    })

    it('handles properties on array items', () => {
      const expected = ['foo', 'bar', '0', 'baz']
      expect(utils._getModelPath('foo.bar.0.baz')).to.eql(expected)
    })
  })

  describe('getSubModel', function () {
    it('returns the model from a simplified dot-notation path', function () {
      const model = {
        type: 'object',
        properties: {
          someProp: {
            type: 'string'
          }
        }
      }
      expect(utils.getSubModel(model, 'someProp')).to.be.eql({
        type: 'string'
      })
    })
    it('returns a model from a deep path', function () {
      const model = {
        type: 'object',
        properties: {
          foo: {
            type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {
                    type: 'object',
                    properties: {
                      qux: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      expect(utils.getSubModel(model, 'foo.bar.baz')).to.be.eql({
        type: 'object',
        properties: {
          qux: {
            type: 'string'
          }
        }
      })
    })
    it('returns a model for an array item', function () {
      const model = {
        type: 'object',
        properties: {
          arrayProp: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
      expect(utils.getSubModel(model, 'arrayProp')).to.be.eql({
        type: 'array',
        items: {
          type: 'string'
        }
      })
    })
    it('returns a model for an array item specified by index', function () {
      const model = {
        type: 'object',
        properties: {
          arrayProp: {
            type: 'array',
            items: {
              type: 'string'
            }
          }
        }
      }
      expect(utils.getSubModel(model, 'arrayProp.0')).to.be.eql({
        type: 'string'
      })
    })
    describe('handles tuple arrays', function () {
      const model = {
        type: 'object',
        properties: {
          arrayProp: {
            type: 'array',
            items: [{
              type: 'string'
            }, {
              type: 'number'
            }],
            additionalItems: {
              type: 'boolean'
            }
          }
        }
      }
      it('with index references', function () {
        expect(utils.getSubModel(model, 'arrayProp.1')).to.be.eql({
          type: 'number'
        })
      })
      it('with an additionalItems schema', function () {
        expect(utils.getSubModel(model, 'arrayProp.5')).to.be.eql({
          type: 'boolean'
        })
      })
    })
    it('handles dependencies correctly', function () {
      expect(utils.getSubModel(dependenciesModel, 'paymentInfo.accountNumber', 'paymentInfo.useEft')).to.be.eql({
        type: 'string'
      })
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
