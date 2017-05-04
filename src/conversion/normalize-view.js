import _ from 'lodash'

/**
 * Ensure model property in bunsen view partial uses dot notation for
 * referning array items by converting square brackets format to dot notation.
 * @param {Object} object - bunsen view partial
 * @returns {Object} normalized bunsen view partial
 */
export function normalizeModelProperty (object) {
  if (Array.isArray(object)) {
    const newArray = object.map((item) => normalizeModelProperty(item))
    const hasArrayChanged = newArray.some((item, index) => item !== object[index])
    return hasArrayChanged ? newArray : object
  }

  // Primitive types (booleans, null, numbers, strings, and undefined)
  if (!_.isPlainObject(object)) {
    return object
  }

  return Object.keys(object).reduce(
    (obj, key) => {
      const isModelProperty = key === 'model' && _.isString(object[key])

      if (!isModelProperty) {
        const newValue = normalizeModelProperty(object[key])

        if (newValue !== object[key]) {
          return Object.assign({}, obj, {[key]: newValue})
        }
      } else {
        // Convert foo[0].bar to foo.0.bar
        const newValue = object[key].replace(/\[/g, '.').replace(/]/g, '')

        if (newValue !== object[key]) {
          return Object.assign({}, obj, {[key]: newValue})
        }
      }

      return obj
    },
    object
  )
}

/**
 * Normalize bunsen view to be more strict (ie. cleaning up model properties)
 * @param {Object} bunsenView - bunsen view
 * @returns {Object} normalized bunsen view
 */
function normalizeView (bunsenView) {
  if (bunsenView.cellDefinitions) {
    const cellDefinitions = normalizeModelProperty(bunsenView.cellDefinitions)

    if (cellDefinitions !== bunsenView.cellDefinitions) {
      bunsenView = Object.assign({}, bunsenView, {cellDefinitions})
    }
  }

  if (bunsenView.cells) {
    const cells = normalizeModelProperty(bunsenView.cells)

    if (cells !== bunsenView.cells) {
      bunsenView = Object.assign({}, bunsenView, {cells})
    }
  }

  return bunsenView
}

export default normalizeView
