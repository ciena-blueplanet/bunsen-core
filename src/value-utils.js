import _ from 'lodash'

function isNotUndefined (item) {
  return item !== undefined
}

function isIfCondition (condition) {
  return _.has(condition, 'if')
}

function getConditionsModel (cells) {
  return cells.map(cell => {
    if (cell.conditions) {
      const isCondition = cell.conditions.some(isIfCondition)
      return isCondition ? cell.model : undefined
    }
    if (cell.children) {
      return getConditionsModel(cell.children)
    }
    return undefined
  })
}

function getModelToDelete (models, cells) {
  cells.forEach(cell => {
    if (cell.model && models.includes(cell.model)) {
      _.remove(models, (model) => model === cell.model)
    }

    if (cell.children) {
      return getModelToDelete(models, cell.children)
    }
  })

  return models
}

export default function evaluateValue (baseView, newView, value) {
  if (baseView.cells === undefined || newView.cells === undefined) {
    return value
  }
  try {
    const conditionsModels = _.flatten(getConditionsModel(baseView.cells)).filter(isNotUndefined)
    const modelToDelete = getModelToDelete(conditionsModels, newView.cells)

    if (modelToDelete.length > 0) {
      return _.omit(value, modelToDelete)
    }

    return value
  } catch (e) {
    return value
  }
}
