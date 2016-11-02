
import _ from 'lodash'
import {validateValue} from './validator'
import {aggregateResults} from './validator/utils'
import {getPath} from './dereference'

export const CHANGE_VALUE = 'CHANGE_VALUE'
export const VALIDATION_RESOLVED = 'VALIDATION_RESOLVED'
export const CHANGE_MODEL = 'SET_MODEL'

export function changeValue (bunsenId, value) {
  return {
    type: CHANGE_VALUE,
    bunsenId,
    value
  }
}

export function changeModel (model) {
  return {
    type: CHANGE_MODEL,
    model
  }
}

export function updateValidationResults (validationResult) {
  const errorsByInput = _.groupBy(validationResult.errors, 'path')
  const errorsFilteredToMessagesOnly = _.mapValues(
    errorsByInput,
    (fieldErrors, bunsenId) => _.map(fieldErrors, 'message')
  )
  const errorsMappedToDotNotation = _.mapKeys(errorsFilteredToMessagesOnly, (value, key) => getPath(key))

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

function findDefaults (value, path, model, resolveRef) {
  let schema

  if (model.$ref !== undefined) {
    schema = getSchema(null, model, resolveRef)
  } else if (path === null) {
    schema = model
  } else {
    const pathStack = path && path.split('.').reverse() || []
    schema = getSchema(pathStack, model, resolveRef)
  }
  const schemaDefault = _.clone(schema.default)
  if (model.type === 'object' || model.properties) { // Recursing only makes sense for objects
    let subSchemaDefaults = {}
    let hasDefaults = false
    _.forEach(schema.properties, function (subSchema, propName) {
      const defaults = findDefaults(value && value[propName], null, subSchema, resolveRef)
      if (defaults !== undefined) {
        subSchemaDefaults[propName] = defaults
        hasDefaults = true
      }
    })
    if (hasDefaults) { // If we didn't find any defaults, we don't want to try to modify the return
      return _.defaults(schemaDefault || {}, subSchemaDefaults)
    }
  } else if (value !== undefined) {
    return value
  }
  return schemaDefault
}

/**
 * Validate action
 * @param {String} bunsenId - bunsen ID of what changed
 * @param {Object} inputValue - value of what changed
 * @param {Object} renderModel - bunsen model
 * @param {Array<Function>} validators - custom validators
 * @param {Function} [all=Promise.all] - framework specific Promise.all method
 * @param {Boolean} [forceValidation=false] - whether or not to force validation
 */
export function validate (
  bunsenId, inputValue, renderModel, validators, all = Promise.all, forceValidation = false
) {
  return function (dispatch, getState) {
    let formValue = getState().value

    const isInputValueEmpty = (
      [undefined, null].indexOf(inputValue) !== -1 ||
      (_.isObject(inputValue) && Object.keys(inputValue).length === 0) // Check if empty object
    )

    const previousValue = _.get(formValue, bunsenId)

    // If an empty value has been provided and there is no previous value then
    // make sure to apply defaults from the model
    if (isInputValueEmpty && previousValue === undefined) {
      const resolveRef = schemaFromRef(renderModel.definitions)
      const defaultValue = findDefaults(inputValue, bunsenId, renderModel, resolveRef)

      if (bunsenId === null && defaultValue === undefined) {
        inputValue = {}
      } else if (defaultValue !== undefined) {
        inputValue = defaultValue
      }
    }

    // if the value never changed, no need to update and validate (unless consumer
    // is forcing validation again)
    if (!forceValidation && _.isEqual(inputValue, previousValue)) {
      return
    }

    dispatch(changeValue(bunsenId, inputValue))

    // We must lookup the formValue again in order for the validation results to
    // be run on the post-change value rather than the pre-change value
    formValue = getState().value

    const result = validateValue(formValue, renderModel)

    const promises = []
    validators.forEach((validator) => {
      promises.push(validator(formValue))
    })

    // Promise.all fails in Node when promises array is empty
    if (all === Promise.all && promises.length === 0) {
      return
    }

    all(promises)
      .then((snapshots) => {
        const results = _.map(snapshots, 'value')
        results.push(result)

        const aggregatedResult = aggregateResults(results)
        // TODO: Dispatch an err action
        dispatch(updateValidationResults(aggregatedResult))
      })
  }
}
