'use strict'

import '../typedefs'
import _ from 'lodash'
import ZSchema from 'z-schema'

import {
  addErrorResult,
  aggregateResults,
  ensureJsonObject,
  validateRequiredAttribute
} from './utils'

import {dereference} from '../dereference'

import customFormats from './custom-formats'

// Register custom formats with z-schema
_.forIn(customFormats, (validator, name) => {
  ZSchema.registerFormat(name, validator)
})

const validator = new ZSchema({
  noTypeless: true,
  forceItems: true
})

/** currently supported model types */
const supportedTypes = ['string', 'object', 'array', 'integer', 'number', 'boolean']

/**
 * Validate the children of the model object (if any exist)
 * @param {String} path - the path to the field from the root of the model
 * @param {BunsenModel} model - the model to validate
 * @param {Function} validateModelType - function to validate model type
 * @returns {BunsenValidationResult} the results of the model validation
 */
function _validateChildren (path, model, validateModelType) {
  const results = [
    {
      errors: [],
      warnings: []
    }
  ]

  if (model.editable !== undefined && typeof model.editable !== 'boolean') {
    addErrorResult(results, `${path}/editable`, `Expected a boolean, found [${JSON.stringify(model.editable)}]`)
  }

  if (model.type === 'object') {
    _.forEach(model.properties, (subModel, key) => {
      const subPath = `${path}/properties/${key}`
      if (key.indexOf('.') !== -1) {
        addErrorResult(results, subPath, 'Property names cannot include "."')
      }
      // We have a circular dependency in these functions, so one needs to be defined before the others
      results.push(validateSubModel(subPath, subModel, validateModelType)) // eslint-disable-line no-use-before-define
    })
  } else if (model.type === 'array') {
    // We have a circular dependency in these functions, so one needs to be defined before the others
    results.push(_validateArray(path, model, validateModelType)) // eslint-disable-line no-use-before-define
  }

  if (model.modelType && !validateModelType(model.modelType)) {
    addErrorResult(results, `${path}/modelType`, 'Invalid modelType reference')
  }

  return aggregateResults(results)
}

/**
 * Validate the sub-model of the model object (if any exist)
 * @param {String} path - the path to the field from the root of the model
 * @param {BunsenModel} subModel - the model to validate
 * @param {Function} validateModelType - function to validate model type
 * @returns {BunsenValidationResult} the results of the model validation
 */
export function validateSubModel (path, subModel, validateModelType) {
  return aggregateResults([
    validateRequiredAttribute(subModel, path, 'type', supportedTypes),
    _validateChildren(path, subModel, validateModelType)
  ])
}

/**
 * Validate the array definition
 * @param {String} path - the path to the field from the root of the model
 * @param {BunsenModel} model - the model to validate
 * @param {Function} validateModelType - function to validate model type
 * @returns {BunsenValidationResult} the results of the model validation
 */
function _validateArray (path, model, validateModelType) {
  const results = []
  let subPath = `${path}/items`
  if (_.isPlainObject(model.items)) {
    if (model.items.type === 'object') {
      results.push(validateSubModel(subPath, model.items, validateModelType))
    }
  } else if (Array.isArray(model.items)) {
    results.push({
      errors: [
        {
          path: subPath,
          message: 'Tuple notation not supported at this time'
        }
      ],
      warnings: []
    })
  }

  return aggregateResults(results)
}

/**
 * Validate the references within a model
 * @param {BunsenModel} model - the model to validate
 * @returns {BunsenValidationResult} the results of validating references
 */
export function validateRefs (model) {
  const resp = dereference(model || {})

  return {
    errors: resp.errors,
    warnings: []
  }
}

/**
 * Validate the entire model
 * @param {BunsenModel} model - the top-level model to validate
 * @param {Function} validateModelType - function to validate model type
 * @returns {BunsenValidationResult} the results of the model validation
 */
export function validate (model, validateModelType) {
  // let strResult = null
  let jsonObject = ensureJsonObject(model)
  model = jsonObject[0]
  let strResult = jsonObject[1]

  if (model === undefined) {
    return {
      errors: [{path: '', message: 'Invalid JSON'}],
      warnings: []
    }
  }

  if (!validator.validateSchema(model)) {
    return {
      errors: validator.getLastErrors(),
      warnings: []
    }
  }

  const results = []
  if (model.type !== 'object') {
    addErrorResult(results, '#/type', 'Only root level "object" type is supported.')
  } else {
    results.push(_validateChildren('#', model, validateModelType))
  }

  if (strResult !== null) {
    results.push(strResult)
  }

  results.push(
    validateRefs(model)
  )

  return aggregateResults(results)
}
