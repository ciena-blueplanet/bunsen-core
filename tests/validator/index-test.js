'use strict'

const expect = require('chai').expect
const _ = require('lodash')

const lib = require('../../lib/validator')

// import viewSchema from 'ember-frost-bunsen/validator/view-schema'
// import readmeContents from '!!raw!../../../README.md'
const missingReqAttrs = require('./fixtures/invalid/missing-required-attributes')
const invalidTypeVersion = require('./fixtures/invalid/invalid-type-version')
const simpleFormConfig = require('./fixtures/simple-form')
const simpleFormModel = require('./fixtures/simple-form-model')
const badContainers = require('./fixtures/invalid/bad-containers')
const badRootContainers = require('./fixtures/invalid/bad-root-containers')
const multipleRootContainers = require('./fixtures/multiple-root-containers')
const transforms = require('./fixtures/transforms')

describe('validator', () => {
  let result

  // TODO: get test working
  /* describe('README.md view schema', () => {
    let readmeSchema
    beforeEach(() => {
      const lines = readmeContents.split('\n')
      let startIndex = lines.indexOf('<!-- BEGIN view-schema.json -->') + 1
      let endIndex = lines.indexOf('<!-- END view-schema.json -->')
      const trimmedLines = lines.slice(startIndex, endIndex)
      startIndex = trimmedLines.indexOf('```json') + 1
      endIndex = trimmedLines.indexOf('```')
      const jsonLines = trimmedLines.slice(startIndex, endIndex)

      readmeSchema = JSON.parse(jsonLines.join('\n'))
    })

    it('matches the schema used by the code', () => {
      expect(readmeSchema).deep.equal(viewSchema)
    })
  }) */

  describe('.validate()', () => {
    describe('when valid', () => {
      beforeEach(() => {
        result = lib.validate(simpleFormConfig, simpleFormModel)
      })

      it('validates', () => {
        expect(result).to.eql({
          errors: [],
          warnings: []
        })
      })
    })

    describe('when required attributes are missing', () => {
      beforeEach(() => {
        result = lib.validate(missingReqAttrs, simpleFormModel)
      })

      it('reports missing "version"', () => {
        expect(result.errors).to.containSubset([{
          message: 'Field is required.',
          path: '#/version'
        }])
      })

      it('reports missing "type"', () => {
        expect(result.errors).to.containSubset([{
          message: 'Field is required.',
          path: '#/type'
        }])
      })

      it('reports missing "containers"', () => {
        expect(result.errors).to.containSubset([{
          message: 'Field is required.',
          path: '#/containers'
        }])
      })

      it('reports missing "rootContainers"', () => {
        expect(result.errors).to.containSubset([{
          message: 'Field is required.',
          path: '#/rootContainers'
        }])
      })
    })

    describe('when version and type are invalid', () => {
      beforeEach(() => {
        result = lib.validate(invalidTypeVersion, simpleFormModel)
      })

      it('gives error message for invalid "version"', () => {
        expect(result.errors).to.containSubset([{
          path: '#/version',
          message: 'No enum match for: 0.1'
        }])
      })

      it('gives error message for invalid "type"', () => {
        expect(result.errors).to.containSubset([{
          path: '#/type',
          message: 'No enum match for: my-custom-type'
        }])
      })
    })

    it('does not complain when multiple root containers', () => {
      const def = _.cloneDeep(multipleRootContainers)
      result = lib.validate(def, simpleFormModel)
      expect(result.errors.length).to.eql(0)
    })

    it('does not complain when transforms are present', () => {
      const def = _.cloneDeep(transforms)
      result = lib.validate(def, simpleFormModel)
      expect(result.errors.length).to.eql(0)
    })

    describe('when rootContainers are bad', () => {
      let def
      beforeEach(() => {
        def = _.cloneDeep(badRootContainers)
      })

      it('when missing "label"', () => {
        def.rootContainers = [def.rootContainers[1]]
        result = lib.validate(def, simpleFormModel)
        expect(result.errors).to.containSubset([{
          path: '#/rootContainers/0/label',
          message: 'Field is required.'
        }])
      })

      it('when invalid "container"', () => {
        def.rootContainers = [def.rootContainers[2]]
        result = lib.validate(def, simpleFormModel)
        expect(result.errors).to.containSubset([{
          path: '#/rootContainers/0',
          message: 'Invalid value "baz" for "container" Valid options are ["foo","bar"]'
        }])
      })
    })

    describe('when container is bad', () => {
      beforeEach(() => {
        result = lib.validate(badContainers, simpleFormModel)
      })

      it('gives error message for missing "rows"', () => {
        expect(result.errors).to.containSubset([{
          path: '#/containers/1/rows',
          message: 'Field is required.'
        }])
      })
    })
  })
})
