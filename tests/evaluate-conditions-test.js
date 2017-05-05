/**
 * Unit tests for the evaluate-schema module
 */

var _ = require('lodash')
var expect = require('chai').expect
var evaluate = require('../lib/evaluate-conditions')
var dereference = require('../lib/dereference')

var simpleModel = require('./fixtures/conditions/simple-model')
var modelWithDeepConditionals = require('./fixtures/conditions/deep-model')
var modelWithRelativePaths = require('./fixtures/conditions/relative-paths-model')
var modelWithArray = require('./fixtures/conditions/array-model')
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

  return evaluate(schema, value)
}

describe('evaluate-conditions', () => {
  var model, newModel, value, expected

  it('can add required properties', function () {
    var data = {
      tagType: 'single-tagged'
    }
    var model = _.cloneDeep(modelWithRequiredConditionals)
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

  describe('conditional properties with "unless"', function () {
    it('are hidden if an "unless" condition is met', function () {
      var data = {
        tagType: 'untagged'
      }
      model = _.cloneDeep(modelWithUnless)
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
      model = _.cloneDeep(modelWithUnless)
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
      model = _.cloneDeep(simpleModel)
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
      model = _.cloneDeep(modelWithDeepConditionals)
      expected = _.cloneDeep(modelWithDeepConditionals)
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
      model = _.cloneDeep(modelWithRelativePaths)
      expected = _.cloneDeep(modelWithRelativePaths)
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
      model = _.cloneDeep(modelWithDefinitions)
      expected = _.cloneDeep(modelWithDefinitions)
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
    beforeEach(() => {
      model = _.cloneDeep(modelWithArray)
      expected = _.cloneDeep(modelWithArray)
    })

    describe('when items have different tagTypes', () => {
      beforeEach(() => {
        value = {
          tags: [
            {tagType: 'single-tagged'},
            {tagType: 'double-tagged'}
          ]
        }
        newModel = dereferenceAndEval(model, value)
      })

      it('evaluates to anyOf the possible items', () => {
        expect(newModel).to.eql({
          type: 'object',
          properties: {
            tags: {
              type: 'array',
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
  })
})
