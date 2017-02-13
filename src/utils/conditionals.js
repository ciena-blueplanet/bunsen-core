import _ from 'lodash'

/**
 * Creates a getter closure for values in a complex object relative to a given path. Uses "prevPath"
 * to search for properties at a parent's level.
 *
 * @export
 * @param {object} valueObj Object we want to search
 * @param {Function} prevPath Getter function for the previous path element
 * @returns {Function} Function that returns a value at the path from the root of the valueObj
 */
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
const possibleConditions = {
  equals: _.isEqual,
  greaterThan: function (value, expected) { return value > expected },
  lessThan: function (value, expected) { return value < expected },
  notEqual: _.negate(_.isEqual)
}

/**
 * Determines if some condition of a cell/model property has been met
 *
 * @export
 * @param {any} value Value to check against
 * @param {object[]} condition List of defined conditions to check
 * @returns  {boolean} True if at least one condition is met
 */
export function meetsCondition (value, condition) {
  return _.some(condition, function (expected, conditionName) {
    return possibleConditions[conditionName](value, expected)
  })
}
