'use strict'

require('../typedefs')
const _ = require('lodash')

const dereference = require('../dereference').dereference
const utils = require('./utils')
const containerValidatorFactory = require('./container')
const viewSchema = require('./view-schemas/v1')

const validateModel = require('./value').validate
const validateValue = require('./value').validate

const lib = {
  builtInRenderers: {
    boolean: 'frost-bunsen-input-boolean',
    'button-group': 'frost-bunsen-input-button-group',
    'multi-select': 'frost-bunsen-input-multi-select',
    number: 'frost-bunsen-input-number',
    'property-chooser': 'frost-bunsen-property-chooser',
    select: 'frost-bunsen-input-select',
    string: 'frost-bunsen-input-text'
  },

  /**
   * Make sure the rootContainers (if specified) are valid
   * @param {BunsenView} view - the schema to validate
   * @param {BunsenModel} model - the JSON schema that the containers will reference
   * @param {ContainerValidator} containerValidator - the validator instance for a container in the current view
   * @returns {BunsenValidationResult} the result of validating the rootContainers
   */
  _validateRootContainers (view, model, containerValidator) {
    // We should already have the error for it not existing at this point, so just fake success
    // this seems wrong, but I'm not sure of a better way to do it - ARM
    if (!view.rootContainers) {
      return {
        errors: [],
        warnings: []
      }
    }

    const results = _.map(view.rootContainers, (rootContainer, index) => {
      const path = `#/rootContainers/${index}`
      const containerId = rootContainer.container
      const containerIndex = _.findIndex(view.containers, {id: containerId})
      const container = view.containers[containerIndex]
      const containerPath = `#/containers/${containerIndex}`
      const rootContainerResults = [
        utils.validateRequiredAttribute(rootContainer, path, 'label'),
        utils.validateRequiredAttribute(rootContainer, path, 'container', _.map(view.containers, (c) => c.id))
      ]

      if (container !== undefined) {
        rootContainerResults.push(
          containerValidator.validate(containerPath, container)
        )
      }

      return utils.aggregateResults(rootContainerResults)
    })

    return utils.aggregateResults(results)
  },

  /**
   * Validate the root attributes of the view
   * @param {BunsenView} view - the view to validate
   * @param {BunsenModel} model - the JSON schema that the containers will reference
   * @param {ContainerValidator} containerValidator - the validator instance for a container in the current view
   * @returns {BunsenValidationResult} any errors found
   */
  _validateRootAttributes (view, model, containerValidator) {
    const results = [
      lib._validateRootContainers(view, model, containerValidator)
    ]

    const knownAttributes = ['version', 'type', 'rootContainers', 'containers']
    const unknownAttributes = _.difference(_.keys(view), knownAttributes)
    results.push({
      errors: [],
      warnings: _.map(unknownAttributes, (attr) => {
        return {
          path: '#',
          message: `Unrecognized attribute "${attr}"`
        }
      })
    })

    return utils.aggregateResults(results)
  },

  /**
   * Validate the given view
   * @param {String|View} view - the view to validate (as an object or JSON string)
   * @param {BunsenModel} model - the JSON schema that the containers will reference
   * @param {String[]} renderers - the list of available custom renderers to validate renderer references against
   * @param {Ember.ApplicationInstance} owner - application instance
   * @returns {BunsenValidationResult} the results of the view validation
   */
  validate (view, model, renderers, owner) {
    renderers = renderers || Object.keys(lib.builtInRenderers)
    let strResult = null
    const temp = utils.ensureJsonObject(view)
    view = temp[0]
    strResult = temp[1]

    if (view === undefined) {
      return {
        errors: [{path: '#', message: 'Invalid JSON'}],
        warnings: []
      }
    }

    if (model === undefined) {
      return {
        errors: [{path: '#', message: 'Invalid Model'}],
        warnings: []
      }
    }

    const derefModel = dereference(model).schema
    const containerValidator = containerValidatorFactory(view.containers, derefModel, renderers, owner)
    const schemaResult = validateValue(view, viewSchema, true)
    if (schemaResult.errors.length !== 0) {
      return schemaResult
    }

    const results = [
      schemaResult,
      lib._validateRootAttributes(view, derefModel, containerValidator)
    ]

    const allContainerPaths = _.map(view.containers, (container, index) => {
      return `#/containers/${index}`
    })

    const validatedPaths = containerValidator.containersValidated
    const missedPaths = _.difference(allContainerPaths, validatedPaths)
    missedPaths.forEach((path) => {
      utils.addWarningResult(results, path, 'Unused container was not validated')
    })

    if (strResult !== null) {
      results.push(strResult)
    }

    return utils.aggregateResults(results)
  },

  // convenience exports so everything can be consumed from this entry point
  validateModel,
  validateValue
}

module.exports = lib
