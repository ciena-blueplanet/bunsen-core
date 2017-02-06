import _ from 'lodash'

export function pathFinder (valueObj, prevPath) {
  return function (path) {
    if (!Array.isArray(path)) {
      path = path.split('.').reverse()
    }
    let nextInPath = _.last(path)

    if (nextInPath === '') { // . for sibling
      path.pop()
      if (_.last(path) === '') { // .. for sibling of parent
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
const possibleConditions = {
  equals: _.isEqual,
  greaterThan: function (value, expected) { return value > expected },
  lessThan: function (value, expected) { return value < expected },
  notEqual: _.negate(_.isEqual)
}
// (value, condition)->boolean
export function meetsCondition (value, condition) {
  return _.reduce(condition, function (memo, expected, conditionName) {
    return memo || possibleConditions[conditionName](value, expected)
  }, false)
}
