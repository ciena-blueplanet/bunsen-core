import _ from 'lodash'
import {meetsCondition, pathFinder} from './utils/conditionals'

/* eslint-disable complexity */
export default function evaluate (model, value, getPreviousValue, formValue) {
  // In some error conditions, model might be empty, and not crashing helps in debugging
  // because the validation error can actually be seen then -- ARM
  if (!model) {
    return model
  }

  if (model.type !== 'object' && model.type !== 'array' && model.properties === undefined) {
    return model
  }

  let retModel = _.clone(model)
  if (retModel.type === 'array') {
    if (Array.isArray(model.items)) {
      retModel.items = _.map(model.items, function (itemModel, index) {
        const val = value && value[index]
        return evaluate(itemModel, val, getPreviousValue, formValue)
      })
      if (model.additionalItems) {
        retModel.additionalItems = evaluate(model.additionalItems, undefined, getPreviousValue)
      }
    } else if (Array.isArray(value)) {
      let itemSchemas = []
        // Deep version of _.uniq
      const potentialSchemas = _.map(value, function (val) {
        return evaluate(model.items, val, getPreviousValue, formValue)
      })
      _.forEach(potentialSchemas, function (schema) {
        if (!_.some(itemSchemas, _.partial(_.isEqual, schema))) {
          itemSchemas.push(schema)
        }
      })
      if (itemSchemas.length < 1) {
        retModel.items = evaluate(model.items, undefined, getPreviousValue, formValue)
      } else if (itemSchemas.length > 1) {
        retModel.items = potentialSchemas
        retModel.additionalItems = evaluate(model.items, undefined, getPreviousValue)
      } else {
        retModel.items = potentialSchemas[0]
      }
    } else if (value === undefined) {
      retModel.items = evaluate(retModel.items, value, getPreviousValue, formValue)
    }
    return retModel
  } else {
    const aggregateType = _.find(['anyOf', 'oneOf'], _.partial(_.includes, Object.keys(model)))
    if (aggregateType !== undefined) {
      retModel[aggregateType] = _.map(retModel[aggregateType], (subSchema) => {
        return evaluate(subSchema, value, getPreviousValue, formValue)
      })
    } else if (model.not) {
      retModel.not = evaluate(retModel.not, value, getPreviousValue, formValue)
    }
  }

  let depsMet = {}

  if (!model.properties) {
    return retModel
  }

  const getValue = pathFinder(value, getPreviousValue)

  retModel.properties = _.clone(model.properties)
  _.forEach(retModel.properties, function (subSchema, propName) {
    retModel.properties[propName] = evaluate(subSchema, _.get(value, propName), pathFinder(value, getValue), formValue)
  })
  let conditionalProperties = _.transform(model.properties, function (result, schema, key) {
    if (schema.conditions) {
      result[key] = schema
    }
  })
  _.forEach(conditionalProperties, function (depSchema, key) {
    depsMet[key] = _.find(depSchema.conditions, function (enableConditions) {
      let hasDependencyMet = true
      const metCondition = conditionItem =>
        _.every(conditionItem, (condition, propName) => {
          const value = getValue(propName)
          return meetsCondition(value, condition, formValue)
        })

      if (enableConditions.unless) {
        const unless = enableConditions.unless.find(metCondition)
        if (unless !== undefined) {
          return false
        }
      }
      if (enableConditions.if) {
        hasDependencyMet = enableConditions.if.find(metCondition) !== undefined
      }
      return hasDependencyMet
    })
  })
  const required = []
  _.forEach(depsMet, function (dependencyMet, depName) {
    const baseSchema = retModel.properties[depName]
    if (dependencyMet) {
      retModel.properties[depName] = _.omit(_.defaults(dependencyMet.then || {}, baseSchema), ['conditions'])
      if (dependencyMet.required) {
        required.push(depName)
      }
    } else {
      delete retModel.properties[depName]
    }
  })
  if (required.length > 0) {
    retModel.required = addNewRequired(required, retModel.required)
  }
  return retModel
}

function addNewRequired (newItems, oldItems) {
  if (!oldItems || oldItems.length <= 0) {
    return newItems
  }
  return _.uniq([].concat(oldItems, newItems))
}
