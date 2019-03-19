import _ from 'lodash'

import {getPath} from './dereference'
import {validateValue} from './validator'
import {aggregateResults} from './validator/utils'

export const CHANGE = 'CHANGE'
export const CHANGE_VALUE = 'CHANGE_VALUE'
export const VALIDATION_RESOLVED = 'VALIDATION_RESOLVED'
export const IS_VALIDATING = 'IS_VALIDATING'
export const CHANGE_MODEL = 'SET_MODEL'
export const CHANGE_VIEW = 'CHANGE_VIEW'

/**
 * Update form value
 * @param {String} bunsenId - path to form property to update (updates entire form if left empty)
 * @param {*} value - new form valud for bunsenId
 * @returns {Object} redux action
 */
export function changeValue (bunsenId, value) {
  return {
    type: CHANGE_VALUE,
    bunsenId,
    value
  }
}

/**
 * Update model
 * @param {BunsenModel} model - new bunsen model
 * @returns {Object} redux action
 */
export function changeModel (model) {
  return {
    type: CHANGE_MODEL,
    model
  }
}

/**
 * Update view
 * @param {BunsenView} view - new bunsen view
 * @returns {Object} redux action
 */
export function changeView (view) {
  return {
    type: CHANGE_VIEW,
    view
  }
}

export function change ({model, view, value}) {
  return {
    type: CHANGE,
    model,
    view
  }
}
function mapErrorsFromValidation (errors) {
  const errorsByInput = _.groupBy(errors, 'path')
  const errorsFilteredToMessagesOnly = _.mapValues(
    errorsByInput,
    (fieldErrors, bunsenId) => _.map(fieldErrors, 'message')
  )
  return _.mapKeys(errorsFilteredToMessagesOnly, (value, key) => getPath(key))
}

export function updateValidationResults (validationResult) {
  const errorsMappedToDotNotation = mapErrorsFromValidation(validationResult.errors)
  return {
    errors: errorsMappedToDotNotation,
    type: VALIDATION_RESOLVED,
    validationResult
  }
}

function invalidPath (refPath) {
  console.warn(`${refPath} is not a valid path`)
  return {}
}

function schemaFromRef (definitions) {
  if (definitions === undefined) {
    return function (refPath) {
      const schema = invalidPath(refPath)
      console.warn('"$ref" can not be used, "definitions" is not defined for this schema')
      return schema
    }
  }

  return function (refPath, resolveRef) {
    const pathStack = refPath.split('/').reverse()
    if (pathStack.pop() !== '#' || pathStack.pop() !== 'definitions') {
      return invalidPath(refPath)
    }
    const startingSchema = definitions[pathStack.pop()]
    if (pathStack.length <= 0) {
      return startingSchema
    }
    return getSchema(pathStack, startingSchema, resolveRef)
  }
}

function getSchema (pathStack, model, resolveRef) {
  if (model.$ref !== undefined) {
    return resolveRef(model.$ref, resolveRef)
  }

  if (pathStack.length <= 0) {
    return model
  }

  if (model.properties) {
    const current = pathStack.pop()
    return getSchema(pathStack, model.properties[current], resolveRef)
  }

  if (model.items) { // This model is an array
    pathStack.pop() // Remove index since it doesn't provide any more useful information
    return getSchema(pathStack, model.items, resolveRef)
  }

  return {}
}

function findSchema (model, path, resolveRef) {
  if (model.$ref !== undefined) {
    return getSchema(null, model, resolveRef)
  } else if (path === null) {
    return model
  }

  const pathStack = path && path.split('.').reverse() || []
  return getSchema(pathStack, model, resolveRef)
}

/**
 * Returns the value with defaults provided by the schema
 * @param {Object} value - a complex object/array (the bunsen form value)
 * @param {String} path - path to retrieve the sub schema of the model given
 * @param {Object} model - bunsen model schema
 * @param {Function} resolveRef - function to resolve references
 * @returns {Object} the value with defaults applied
 */
function getDefaults (value, path, model, resolveRef) {
  const schema = findSchema(model, path, resolveRef)
  const schemaDefault = _.clone(schema.default)

  if (model.type === 'object') {
    const subSchemaDefaults = {}
    _.forIn(schema.properties, function (subSchema, propName) {
      const defaults = getDefaults(
        value && value[propName],
        null,
        subSchema,
        resolveRef
      )
      if (defaults !== undefined) {
        subSchemaDefaults[propName] = defaults
      }
    })

    if (Object.keys(subSchemaDefaults).length > 0) {
      return _.defaults({}, schemaDefault, subSchemaDefaults)
    }
    return schemaDefault
  } else if (value !== undefined) {
    return value
  }
  return schemaDefault
}

function isEmptyValue (value) {
  return [undefined, null].indexOf(value) !== -1 ||
  (_.isObject(value) && Object.keys(value).length === 0) // Check if empty object
}

function dispatchUpdatedResults (dispatch, results) {
  const {errors, warnings} = aggregateResults(results)
  // TODO: Dispatch an err action
  dispatch(updateValidationResults({
    errors: errors,
    warnings: warnings
  }))
}

/**
 * Returns the default value for the given model
 *
 * @param {Object} inputValue - form value at the given bunsen path
 * @param {Object} previousValue - the previous form value at the given bunsen path
 * @param {String} bunsenId - the bunsen path id
 * @param {Object} renderModel - the bunsen model without conditions
 * @param {Boolean} mergeDefaults - whether to force a default value on a non-empty value
 */
/* eslint-disable complexity */
function getDefaultedValue ({inputValue, previousValue, bunsenId, renderModel, mergeDefaults}) {
  const isInputValueEmpty = isEmptyValue(inputValue)

  if (previousValue !== undefined) {
    return inputValue
  }

  const resolveRef = schemaFromRef(renderModel.definitions)
  const defaultValue = getDefaults(inputValue, bunsenId, renderModel, resolveRef)
  const hasDefaults = defaultValue !== undefined
  const isUpdatingAll = bunsenId === null

  const shouldApplyDefaults = isInputValueEmpty && hasDefaults ||
    !isInputValueEmpty && hasDefaults && isUpdatingAll && mergeDefaults
  const shouldClear = isInputValueEmpty && isUpdatingAll && !hasDefaults

  if (shouldApplyDefaults) {
    const schema = findSchema(renderModel, bunsenId, resolveRef)
    return schema.type === 'object' ? _.defaults({}, inputValue, defaultValue) : defaultValue
  } else if (shouldClear) {
    return {}
  }

  return inputValue
}

/**
 * Validate action
 * @param {String} bunsenId - bunsen ID of what changed
 * @param {Object} inputValue - value of what changed
 * @param {Object} renderModel - bunsen model
 * @param {Array<Function>} validators - custom validators
 * @param {Array<Object>} fieldValidators - custom field validators
 * @param {Function} [all=Promise.all] - framework specific Promise.all method
 * @param {Boolean} [forceValidation=false] - whether or not to force validation
 * @param {Boolean} [mergeDefaults=false] - whether to merge defaults with initial values
 * @returns {Function} Function to asynchronously validate
 */
export function validate (
  bunsenId, inputValue, renderModel, validators, fieldValidators,
   all = Promise.all, forceValidation = false, mergeDefaults = false
) {
  return function (dispatch, getState) {
    const {value: initialFormValue} = getState()
    let formValue = initialFormValue
    const previousValue = _.get(formValue, bunsenId)

    inputValue = getDefaultedValue({inputValue, previousValue, bunsenId, renderModel, mergeDefaults})

    if (!forceValidation && _.isEqual(inputValue, previousValue)) {
      return
    }

    if (!forceValidation) {
      dispatch(changeValue(bunsenId, inputValue))
      // We must lookup the formValue again in order for the validation results to
      // be run on the post-change value rather than the pre-change value
      ;({value: formValue, model: renderModel} = getState())
    }

    const result = validateValue(formValue, renderModel)

    const promises = []
    dispatch({
      type: IS_VALIDATING,
      isValidating: true
    })
    validators.forEach((validator) => {
      const type = typeof validator
      if (type === 'function') {
        // Original validation. Always validates
        promises.push(validator(formValue))
      }
    })

    const fieldValidationPromises = fieldValidators ? fieldValidation(dispatch, getState,
      fieldValidators, formValue, initialFormValue) : []

    // Promise.all fails in Node when promises array is empty
    if (promises.length === 0) {
      dispatchUpdatedResults(dispatch, [result])
      dispatchDoneValidating(dispatch, fieldValidationPromises, all)
      return
    }

    all(promises)
      .then((snapshots) => {
        const results = _.map(snapshots, 'value')
        results.push(result)
        dispatchUpdatedResults(dispatch, results)
      }).then(() => dispatchDoneValidating(dispatch, fieldValidationPromises, all))
  }
}
function dispatchDoneValidating (dispatch, fieldValidationPromises, all) {
  if (fieldValidationPromises.length === 0) {
    dispatch({
      type: IS_VALIDATING,
      isValidating: false
    })
  } else {
    return all(fieldValidationPromises).then(() => {
      dispatch({
        type: IS_VALIDATING,
        isValidating: false
      })
    })
  }
}

/**
 * Field validation. Only validate if field has changed.
 * Meant for expensive validations like server side validation
 * @function fieldValidation
 * @param  {Function} dispatch        Redux store dispacth
 * @param  {Function} getState        Function that returns current state of store
 * @param  {Array<Object>} fieldValidators     Array of field validators
 * @param  {type} formValue           value of what changed
 * @param  {type} initialFormValue    initial value before change
 * @returns {Array<Promise>} Array of field validation promies
 */
function fieldValidation (dispatch, getState, fieldValidators, formValue, initialFormValue) {
  let fieldsBeingValidated = []
  const promises = []
  fieldValidators.forEach(validator => {
    /**
     * Field validator definition
     * @property {String} field field to validate
     * @property {String[]} fields fields to validate
     * @property {Function} validator valdation function to validate field/fields. Must return field within error/warning
     * @property {Function[]} validators valdation functions to validate field/fields. Must return field within error/warning
     */
    const {field, fields, validator: validatorFunc, validators: validatorFuncs} = validator

    const fieldsToValidate = fields || [field]
    fieldsBeingValidated = fieldsBeingValidated.concat(fieldsToValidate)
    fieldsToValidate.forEach((field) => {
      const newValue = _.get(formValue, field)
      const oldValue = _.get(initialFormValue, field)

      // Check if field value has changed
      if (!_.isEqual(newValue, oldValue) || !initialFormValue) {
        const validations = validatorFuncs || [validatorFunc]
            // Send validator formValue, the field we're validating against, and the field's value
        validations.forEach((validatorFunc, index) => promises.push(validatorFunc(formValue, field, newValue)
        .then((result) => {
          const {
            fieldValidationResult: {
              errors: currentErrors = [],
              warnings: currentWarnings = []
            } = {}
          } = getState()
          const validationId = `${field}-${index}`
          const filterOutValidationId = (item) => item.validationId !== validationId
          const filteredOutErors = currentErrors.filter(filterOutValidationId)
          const filteredOutWarnings = currentWarnings.filter(filterOutValidationId)

          // No need to use `aggeragateResult as we should never have isRequired
          const {errors = [], warnings = []} = result.value
          const attachValidatationId = (item) => {
            return _.assign({
              validationId,
              field
            }, item)
          }
          const newErrors = filteredOutErors.concat(errors.map(attachValidatationId))
          const errorsMappedToDotNotation = mapErrorsFromValidation(newErrors)

          dispatch({
            fieldErrors: errorsMappedToDotNotation,
            type: VALIDATION_RESOLVED,
            fieldValidationResult: {
              errors: newErrors,
              warnings: filteredOutWarnings.concat(warnings.map(attachValidatationId))
            }
          })

          return result
        })))
      }
    })
  })

  return promises
}
