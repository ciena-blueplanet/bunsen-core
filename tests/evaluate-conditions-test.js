/**
 * Unit tests for the evaluate-schema module
 */

var _ = require('lodash')
var expect = require('chai').expect
var evaluate = require('../lib/evaluate-conditions')
var dereference = require('../lib/dereference')

var deepFreeze = require('./deep-freeze')
var simpleModel = require('./fixtures/conditions/simple-model')
var modelWithDeepConditionals = require('./fixtures/conditions/deep-model')
var modelWithRelativePaths = require('./fixtures/conditions/relative-paths-model')
var modelWithArray = require('./fixtures/conditions/array-model')
var modelWithTupleArray = require('./fixtures/conditions/tuple-model')
var modelWithDefinitions = require('./fixtures/conditions/definitions-model')
var modelWithUnless = require('./fixtures/conditions/unless-model')
var modelWithRequiredConditionals = require('./fixtures/conditions/required-conditionals-model')

/**
 * Used to deference the
 * @param {Object} model - model to evaluate
 * @param {Object} value - value
 * @returns {Object} the evaluated model
 */
function dereferenceAndEval (model, value) {
  var schema = dereference.dereference(model).schema
  delete schema.definitions

  return evaluate(schema, value, undefined, value)
}

describe('evaluate-conditions', () => {
  var model, newModel, value, expected

  it('can add required properties', function () {
    var data = {
      tagType: 'single-tagged'
    }
    var model = deepFreeze(modelWithRequiredConditionals)
    var newModel = dereferenceAndEval(model, data)
    expect(newModel).to.eql({
      type: 'object',
      properties: {
        tagType: {
          type: 'string',
          enum: ['untagged', 'single-tagged', 'double-tagged']
        },
        tag: {
          type: 'string'
        }
      },
      required: ['tag']
    })
  })

  it('should propagate required', function () {
    const model = {
      type: 'object',
      properties: {
        conditionValue: {type: 'string'},
        foo: {
          type: 'object',
          properties: {
            bar: {
              type: 'string',
              conditions: [{
                if: [{
                  '../conditionValue': {
                    equals: 'bar'
                  }
                }],
                required: true
              }]
            }
          }
        }
      }
    }

    var newModel = dereferenceAndEval(model, {
      conditionValue: 'bar'
    })

    expect(newModel.required).to.eql(['foo'])
  })

  describe('conditional properties with "unless"', function () {
    it('are hidden if an "unless" condition is met', function () {
      var data = {
        tagType: 'untagged'
      }
      model = deepFreeze(modelWithUnless)
      var newModel = dereferenceAndEval(model, data)
      expect(newModel).to.eql({
        'type': 'object',
        'properties': {
          'tagType': {
            'type': 'string',
            'enum': ['untagged', 'single-tagged', 'double-tagged']
          }
        }
      })
    })
    it('are not hidden if an "unless" no condition is met', function () {
      var data = {
        tagType: 'double-tagged'
      }
      model = deepFreeze(modelWithUnless)
      var newModel = dereferenceAndEval(model, data)
      expect(newModel).to.eql({
        type: 'object',
        properties: {
          tagType: {
            type: 'string',
            enum: ['untagged', 'single-tagged', 'double-tagged']
          },
          tag: {
            type: 'number',
            default: 20,
            multipleOf: 1.0,
            minimum: 0,
            maximum: 4094
          },
          tag2: {
            type: 'number',
            default: 3000,
            multipleOf: 1.0,
            minimum: 0,
            maximum: 4094
          }
        }
      })
    })
  })

  it('does not add additional undefined properties', function () {
    model = {
      type: 'object'
    }
    var newModel = dereferenceAndEval(model, {})
    expect('properties' in newModel).to.equal(false)
  })

  describe('when nothing passed in', () => {
    beforeEach(() => {
      newModel = evaluate(undefined, {})
    })

    it('returns what was given', () => {
      expect(newModel).to.be.equal(undefined)
    })
  })

  describe('simple model', () => {
    beforeEach(() => {
      model = deepFreeze(simpleModel)
      expected = _.cloneDeep(simpleModel)
    })

    describe('when no value given', () => {
      beforeEach(() => {
        value = {}
        newModel = dereferenceAndEval(model, value)
      })

      it('trims the tags', () => {
        delete expected.properties.tag
        delete expected.properties.tag2

        expect(newModel).to.eql(expected)
      })
    })

    describe('when tagType is single-tagged', () => {
      beforeEach(() => {
        value = {
          tagType: 'single-tagged'
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('strips out the second tag', () => {
        delete expected.properties.tag.conditions
        delete expected.properties.tag2
        expect(newModel).to.eql(expected)
      })
    })

    describe('when tagType is double-tagged', () => {
      beforeEach(() => {
        value = {
          tagType: 'double-tagged'
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('includes all three properties', () => {
        delete expected.properties.tag.conditions
        delete expected.properties.tag2.conditions

        expect(newModel).to.eql(expected)
      })
    })

    describe('when tagType is foo-tagged', () => {
      beforeEach(() => {
        value = {
          tagType: 'foo-tagged'
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('includes a modified tag property', () => {
        delete expected.properties.tag.conditions
        _.assign(expected.properties.tag, {
          default: 120,
          minimum: 100,
          maximum: 200
        })
        delete expected.properties.tag2

        expect(newModel).to.eql(expected)
      })
    })
  })

  describe('nested objects', () => {
    beforeEach(() => {
      model = deepFreeze(modelWithDeepConditionals)
      expected = deepFreeze(modelWithDeepConditionals)
    })

    describe('when single-tagged', () => {
      beforeEach(() => {
        value = {
          tags: {
            tagType: 'single-tagged'
          }
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('trims out tag2', () => {
        delete expected.properties.tags.properties.tag2
        delete expected.properties.tags.properties.tag.conditions
        expect(newModel).to.be.eql(expected)
      })
    })
  })

  describe('relative paths', () => {
    beforeEach(() => {
      model = deepFreeze(modelWithRelativePaths)
      expected = deepFreeze(modelWithRelativePaths)
    })

    describe('when single-tagged', () => {
      beforeEach(() => {
        value = {
          tagType: 'single-tagged'
        }

        newModel = dereferenceAndEval(model, value)
      })

      it('shows just the first tag', () => {
        delete expected.properties.tags.properties.tag.conditions
        delete expected.properties.tags.properties.tag2
        expect(newModel).to.eql(expected)
      })
    })
  })

  describe('definitions', () => {
    beforeEach(() => {
      model = deepFreeze(modelWithDefinitions)
      expected = deepFreeze(modelWithDefinitions)
    })

    describe('when single-tagged', () => {
      beforeEach(() => {
        value = {
          tagType: 'single-tagged'
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('includes only the first tag', () => {
        expected.properties.myTags = expected.definitions.tags
        delete expected.definitions
        delete expected.properties.myTags.properties.tag.conditions
        delete expected.properties.myTags.properties.tag2

        expect(newModel).to.eql(expected)
      })
    })
  })

  describe('arrays', () => {
    describe('when items have different tagTypes', () => {
      beforeEach(() => {
        model = _.cloneDeep(modelWithArray)
        expected = _.cloneDeep(modelWithArray)
        value = {
          tags: [
            {tagType: 'single-tagged'},
            {tagType: 'double-tagged'}
          ]
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('evaluates to an array the possible items', () => {
        expect(newModel).to.eql({
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              additionalItems: {
                type: 'object',
                properties: {
                  tagType: {
                    type: 'string',
                    enum: ['untagged', 'single-tagged', 'double-tagged']
                  }
                }
              },
              arrayType: 'list',
              items: [{
                type: 'object',
                properties: {
                  tagType: {
                    type: 'string',
                    enum: ['untagged', 'single-tagged', 'double-tagged']
                  },
                  tag: {
                    type: 'number',
                    default: 20,
                    multipleOf: 1.0,
                    minimum: 0,
                    maximum: 4094
                  }
                }
              }, {
                type: 'object',
                properties: {
                  tagType: {
                    type: 'string',
                    enum: ['untagged', 'single-tagged', 'double-tagged']
                  },
                  tag: {
                    type: 'number',
                    default: 20,
                    multipleOf: 1.0,
                    minimum: 0,
                    maximum: 4094
                  },
                  tag2: {
                    type: 'number',
                    default: 3000,
                    multipleOf: 1.0,
                    minimum: 0,
                    maximum: 4094
                  }
                }
              }]
            }
          }
        })
      })
    })

    it('handles tuple style arrays', function () {
      model = _.cloneDeep(modelWithTupleArray)
      expected = {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['type1', 'type2']
          },
          foo: {
            type: 'array',
            items: [{
              type: 'string'
            }, {
              type: 'number'
            }],
            additionalItems: {
              type: 'object',
              properties: {
                baz: {
                  type: 'string',
                  enum: ['foo', 'bar', 'baz']
                }
              }
            }
          }
        }
      }
      value = {kind: 'type1'}
      newModel = dereferenceAndEval(model, value)
      expect(newModel).to.eql(expected)
    })

    it('handles empty arrays', function () {
      model = _.cloneDeep(modelWithArray)
      expected = {
        type: 'object',
        properties: {
          tags: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tagType: {
                  type: 'string',
                  enum: ['untagged', 'single-tagged', 'double-tagged']
                }
              }
            }
          }
        }
      }
      value = {
        tags: []
      }
      newModel = dereferenceAndEval(model, value)
      expect(newModel).to.eql(expected)
    })
  })

  describe('condition referencing form values', function () {
    let condition, model
    beforeEach(function () {
      condition = {}

      model = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            conditions: [{
              if: [{
                './bar': condition
              }]
            }]
          },
          bar: {
            type: 'string'
          },
          baz: {
            type: 'string'
          }
        }
      }
    })

    describe('simple expectation with valid reference', function () {
      beforeEach(function () {
        condition['equals'] = '#/baz'
      })

      it('should evaluate true when condition is met', function () {
        const value = {bar: 'foo', baz: 'foo'}
        expect(dereferenceAndEval(model, value)).to.eql({
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            }
          }
        })
      })

      it('should evaluate false when condition is not met', function () {
        const value = {bar: 'bar', baz: 'foo'}
        expect(dereferenceAndEval(model, value)).to.eql({
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            }
          }
        })
      })
    })

    describe('simple expectation with invalid reference', function () {
      it('should evaluate false', function () {
        condition['equals'] = '#/barrrrr'
        const value = {bar: 'foo', baz: 'foo'}
        expect(dereferenceAndEval(model, value)).to.eql({
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            }
          }
        })
      })
    })

    describe('array expectation with valid reference', function () {
      beforeEach(function () {
        condition['isEither'] = ['#/baz', 'bar']
      })

      it('should evaluate true when condition is met', function () {
        const value = {bar: 'bar'}
        expect(dereferenceAndEval(model, value)).to.eql({
          type: 'object',
          properties: {
            foo: {
              type: 'string'
            },
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            }
          }
        })
      })

      it('should evaluate false when condition is not met', function () {
        const value = {bar: 'foo'}
        expect(dereferenceAndEval(model, value)).to.eql({
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            }
          }
        })
      })
    })

    describe('array expectation with invalid reference', function () {
      it('should evaluate false', function () {
        condition['isEither'] = ['#/bazzzz', '#/bazzzzzzzz']
        const value = {bar: 'foo', baz: 'foo'}
        expect(dereferenceAndEval(model, value)).to.eql({
          type: 'object',
          properties: {
            bar: {
              type: 'string'
            },
            baz: {
              type: 'string'
            }
          }
        })
      })
    })
  })
})
