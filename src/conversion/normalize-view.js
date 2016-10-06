import _ from 'lodash'

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
