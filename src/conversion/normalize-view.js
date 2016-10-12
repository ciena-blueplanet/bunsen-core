import _ from 'lodash'

/**
 * Ensure model property in bunsen view partial uses dot notation for
 * referning array items by converting square brackets format to dot notation.
 * @param {Object} object - bunsen view partial
 * @returns {Object} normalized bunsen view partial
 */
export function normalizeModelProperty (object) {
  if (Array.isArray(object)) {
    return object
      .map((item) => {
        return normalizeModelProperty(item)
      })
  }

  if (!_.isPlainObject(object)) {
    return object
  }

  Object.keys(object)
    .forEach((key) => {
      const isModelProperty = key === 'model' && _.isString(object[key])

      if (!isModelProperty) {
        object[key] = normalizeModelProperty(object[key])
        return
      }

      // Convert foo[0].bar to foo.0.bar
      object[key] = object[key].replace(/\[/g, '.').replace(/]/g, '')
    })

  return object
}

/**
 * Normalize bunsen view to be more strict (ie. cleaning up model properties)
 * @param {Object} bunsenView - bunsen view
 * @returns {Object} normalized bunsen view
 */
function normalizeView (bunsenView) {
  if (bunsenView.cellDefinitions) {
    normalizeModelProperty(bunsenView.cellDefinitions)
  }

  if (bunsenView.cells) {
    normalizeModelProperty(bunsenView.cells)
  }

  return bunsenView
}

export default normalizeView
