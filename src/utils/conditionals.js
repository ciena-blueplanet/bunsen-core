import _ from 'lodash'

export function pathFinder (valueObj, prevPath) {
  return function (path) {
    if (!Array.isArray(path)) {
      path = path.split('.').reverse()
    }
    let nextInPath = _.last(path)

    if (nextInPath === '') { // './' for sibling (periods converted to '' by split)
      path.pop()
      if (_.last(path) === '') { // '../' for sibling of parent (periods converted to '' by split)
        path.pop()
        path.push(path.pop().replace('/', '')) // get rid of leading slash
        return prevPath(path)
      } else {
        path.push(path.pop().replace('/', ''))
      }
    }
    return _.get(valueObj, path.reverse().join('.'))
  }
}

const getExpectedValue = function (formValue, expected) {
  if (typeof expected === 'string' && expected.startsWith('#/')) {
    return _.get(formValue, expected.replace('#/', ''))
  }
  return expected
}

const predicateWrapper = function (predicate) {
  return function (value, expected, formValue) {
    if (expected === undefined) {
      throw new Error('expected value is undefined')
    }

    if (Array.isArray(expected)) {
      return predicate(value, expected.map((item) => getExpectedValue(formValue, item)))
    }

    return predicate(value, getExpectedValue(formValue, expected))
  }
}

export const BUILT_IN_CONDITIONS = {
  equals: _.isEqual,
  greaterThan: function (value, expected) { return value > expected },
  lessThan: function (value, expected) { return value < expected },
  notEqual: _.negate(_.isEqual),
  isDefined: _.negate(_.isUndefined),
  isUndefined: _.isUndefined,
  isNull: _.isNull,
  isNotNull: _.negate(_.isNull),
  isNil: _.isNil,
  isNotNil: _.negate(_.isNil),
  isNaN: Number.isNaN,
  hasLength: function (value, expected) { return value.length === expected },
  isLongerThan: function (value, expected) { return value.length > expected },
  isShorterThan: function (value, expected) { return value.length < expected },
  matchesRegExp: function (value, expected) {
    const regExp = new RegExp(expected)
    return regExp.test(value)
  },
  includes: function (value, expected) {
    if (value === undefined) {
      return false
    }

    if (typeof value !== 'string' && !Array.isArray(value)) {
      throw new Error('Using `includes` condition for non-support type')
    }
    return value.includes(expected)
  },
  isEither: function (value, expected) {
    if (!Array.isArray(expected)) {
      throw new Error('Using `isEither` on non-array type is not supported')
    }

    return expected.some((val) => val === value)
  }
}

Object.keys(BUILT_IN_CONDITIONS).forEach((condition) => {
  BUILT_IN_CONDITIONS[condition] = predicateWrapper(BUILT_IN_CONDITIONS[condition])
})

let possibleConditions = BUILT_IN_CONDITIONS

export function addConditions (conditions) {
  possibleConditions = _.merge({}, possibleConditions, conditions)
}

export function meetsCondition (value, condition, formValue) {
  return _.some(condition, function (expected, conditionName) {
    if (!(conditionName in possibleConditions)) {
      throw new Error(`condition <${conditionName}> is not supported`)
    }
    return possibleConditions[conditionName](value, expected, formValue)
  })
}
