/**
 * @module evaluate-conditions
 * Export a single function to accept a model schema which includes conditions and return one where the conditions are
 * evaluated/removed.
 */

import _ from 'lodash'
import {pathFinder, meetsCondition} from './utils/conditionals'

/* eslint-disable complexity */
export default function evaluate (model, value, getPreviousValue) {
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
    if (Array.isArray(value)) {
      let itemSchemas = []
      // Deep version of _.uniq
      const potentialSchemas = _.map(value, function (val) {
        return evaluate(model.items, val, getPreviousValue)
      })
      _.forEach(potentialSchemas, function (schema) {
        if (!_.some(itemSchemas, _.partial(_.isEqual, schema))) {
          itemSchemas.push(schema)
        }
      })
      if (itemSchemas.length > 1) {
        retModel.items = {anyOf: itemSchemas}
      } else if (itemSchemas.length === 0) {
        retModel.items = _.clone(model.items)
      } else {
        retModel.items = itemSchemas[0]
      }
    } else if (value === undefined) {
      retModel.items = evaluate(retModel.items, value, getPreviousValue)
    }
    return retModel
  } else {
    const aggregateType = _.find(['anyOf', 'oneOf'], _.partial(_.includes, Object.keys(model)))
    if (aggregateType !== undefined) {
      retModel[aggregateType] = _.map(retModel[aggregateType], (subSchema) => {
        return evaluate(subSchema, value, getPreviousValue)
      })
    } else if (model.not) {
      retModel.not = evaluate(retModel.not, value, getPreviousValue)
    }
  }

  let depsMet = {}
  let props = {}

  if (!model.properties) {
    return retModel
  }

  const getValue = pathFinder(value, getPreviousValue)

  retModel.properties = _.clone(model.properties)
  _.forEach(retModel.properties, function (subSchema, propName) {
    retModel.properties[propName] = evaluate(subSchema, _.get(value, propName), pathFinder(value, getValue))
  })
  let conditionalProperties = _.transform(model.properties, function (result, schema, key) {
    if (schema.conditions) {
      result[key] = schema
    }
  })
  _.forEach(conditionalProperties, function (depSchema, key) {
    depsMet[key] = _.some(depSchema.conditions, function (enableConditions) {
      const hasDependencyMet = _.some(enableConditions.if, function (conditionList) {
        return _.every(conditionList, function (conditionValue, dependencyKey) {
          const dependencyValue = getValue(dependencyKey)
          return meetsCondition(dependencyValue, conditionValue)
        })
      })
      if (hasDependencyMet && enableConditions.then !== undefined) {
        props[key] = _.cloneDeep(enableConditions.then)
      }
      return hasDependencyMet
    })
  })
  _.forEach(depsMet, function (dependencyMet, depName) {
    const baseSchema = retModel.properties[depName]
    if (dependencyMet && !baseSchema.set || !dependencyMet && baseSchema.set) {
      retModel.properties[depName] = _.omit(_.defaults(props[depName] || {}, baseSchema), ['conditions', 'set'])
    } else {
      delete retModel.properties[depName]
    }
  })

  return retModel
}
