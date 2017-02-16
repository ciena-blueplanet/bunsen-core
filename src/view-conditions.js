import './typedefs'
import {meetsCondition} from './utils/conditionals'
import _ from 'lodash'
import Immutable from 'seamless-immutable'

/**
 * Function used for filtering out undefined values from arrays.
 *
 * @param {any} item Item we want to check the value of
 * @returns {boolean} True if the provided value is not undefined
 */
function isNotUndefined (item) {
  return item !== undefined
}

/**
 * Check a list conditions for a cell against a provided value
 *
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @returns {Function} Function that returns true if a condition has been met
 */
function checkConditions (value) {
  return function (condition) {
    const metCondition = conditionItem =>
        _.every(conditionItem, (condition, propName) =>
          meetsCondition(value.get(propName), condition)
        )

    if (condition.unless) {
      const unless = condition.unless.find(metCondition)
      if (unless !== undefined) {
        return false
      }
    }
    if (condition.if) {
      return isNotUndefined(condition.if.find(metCondition))
    } else {
      return true
    }
  }
}

/**
 * Check the root cells of a view
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @returns {Function} Iterator function to check cells
 */
function checkRootCells (view, value) {
  return function (cell) {
    return checkCell(view, value, Immutable.from(cell)).asMutable()
  }
}

/**
 * Check a cell for conditions and apply any conditional properties if a condition is met.
 *
 * @param {BunsenView} view View the cell is a part of
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} The cell after conditions have been processed. If a condition is not met undefined is returned
 */
function checkCellConditions (view, value, cell) {
  // Find a condition that has been met
  const meetsCondition = checkConditions(value)
  const condition = cell.conditions.find(meetsCondition)
  if (condition === undefined) {
    // Returns undefined if conditions aren't met so we can filter
    return
  }

  if (condition.then) { // Cell has conditional properties, so add them
    cell = Immutable.merge(cell, condition.then)
  }
  return cell
}

/**
 * Copy properties from an extended cell. Extends child cells recrusively.
 *
 * @param {BunsenView} view View the cell is a part of
 * @param {BunsenCell} cell Cell to copy properties onto
 * @returns {BunsenCell} Resulting cell after applying properties from extended cells
 */
function expandExtendedCell (view, cell) {
  const cellProps = {}
  let extendedCell = _.get(view.cellDefinitions, cell.extends)
  if (extendedCell.extends) {
    extendedCell = Immutable.without(expandExtendedCell(view, extendedCell), 'extends')
  }

  if (extendedCell.itemCell && extendedCell.itemCell.extends) {
    cellProps.itemCell = expandExtendedCell(view, extendedCell.itemCell)
  }

  if (extendedCell.children) {
    cellProps.children = extendedCell.children.map(child => {
      if (child.extends) {
        return expandExtendedCell(view, child)
      }
      return child
    })
  }

  return Immutable.merge(cell, extendedCell, cellProps)
}

/**
 * Check a cell of a view to make sure the value meets any conditions the cell provides
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} Cell with properties from any extended cells
 */
function checkCell (view, value, cell) {
  if (cell.extends) {
    cell = expandExtendedCell(view, cell)
  }

  value = value.pushPath(cell.model)

  if (cell.conditions) { // This cell has conditions
    cell = checkCellConditions(view, value, cell)
    if (cell === undefined) {
      return
    }
  }

  if (cell.children) {
    cell = checkChildren(view, value, cell)
  }

  return Immutable.without(cell, 'conditions', 'extends')
}

/**
 * Check conditions of a cell's children
 *
 * @param {BunsenView} view View we are checking
 * @param {ValueWrapper} value The wrapped value we want to check the conditions against
 * @param {BunsenCell} cell Cell to check
 * @returns {BunsenCell} Cell with the children checked
 */
function checkChildren (view, value, cell) {
  const children = _.map(cell.children, (child) => {
    return checkCell(view, value, child)
  })
  .filter(isNotUndefined)

  return Immutable.set(cell, 'children', children)
}

/**
 * Apply conditions (and extensions) to the cells of a view
 *
 * @export
 * @param {BunsenView} view View to process
 * @param {any} value The value we want to check conditions against
 * @returns {BunsenView} View after conditions have been applied
 */
export default function evaluateView (view, value) {
  const wrappedValue = new ValueWrapper(value, [])
  const immutableView = Immutable.from(view)
  if (view.cells === undefined) {
    return view
  }
  try {
    const cells = _.chain(view.cells)
      .map(checkRootCells(immutableView, wrappedValue))
      .filter(isNotUndefined)
      .value()

    return Object.assign(_.clone(view), {
      cells
    })
  } catch (e) {
    // Unfortunately this is necessary because view validation happens outside of the reducer,
    // so we have no guarantee that the view is valid and it may cause run time errors. Returning
    return view
  }
}
/* eslint-disable complexity */
/**
 * Find how many path elements we have to go back in order to find the absolute path
 *
 * @param {string[]} path Array of path elements. THIS ARRAY IS MUTATED BY THE FUNCTION
 * @param {number} [index=0] How many elements we've already gone back
 * @returns {number} How many elements back we need go
 */
function findRelativePath (path, index = 0) {
  let nextInPath = _.last(path)

  if (nextInPath === '') { // . for sibling
    if (index <= 0) {
      index += 1
    }
    path.pop()
    if (_.last(path) === '') { // .. for sibling of parent
      path.pop()
      nextInPath = path.pop().replace('/', '')// get rid of leading slash
      if (nextInPath === '') {
        return findRelativePath(path, index + 1)
      }
      path.push(nextInPath)
      return index + 1
    } else {
      nextInPath = path.pop().replace('/', '')// get rid of leading slash
      if (nextInPath === '') {
        return findRelativePath(path, index)
      }
      path.push(nextInPath)
      return index
    }
  }
}
/* eslint-enable complexity */

/**
 * Class to wrap value objects to find values based on relative and absolute paths
 *
 * @class ValueWrapper
 */
class ValueWrapper {
  static pathAsArray (path) {
    if (!Array.isArray(path)) {
      return path.split('.')
    }
    return path
  }

  constructor (value, curPath) {
    this.value = value
    this.path = ValueWrapper.pathAsArray(curPath)
  }

  /**
   * Get the value at an absolute or relative path. Paths with a leading './' or '../' are treated as relative,
   * and others are treated as absolute.
   *
   * Relative paths are relative to a stored path. To add to the path use the pushPath method.
   *
   * @param {string | string[]} path Path to the desired value.
   * @returns {any} Value at the given path.
   *
   * @memberOf ValueWrapper
   */
  get (path) {
    let absolutePath
    if (path === undefined) {
      if (this.path.length <= 0) {
        return this.value
      }
      return _.get(this.value, this.path.join('.'))
    }
    path = ValueWrapper.pathAsArray(path)

    let nextInPath = _.first(path)

    if (nextInPath === '') {
      let index = findRelativePath(path.reverse())
      absolutePath = this.path.slice(0, this.path.length - index).concat(path)
    } else {
      absolutePath = path
    }

    return _.get(this.value, absolutePath.join('.'))
  }

  /**
   * Creates another value wrapper with a relative path
   *
   * @param {string | string[]} path Element(s) to add to the currently stored path
   * @returns {ValueWrapper} A value wrapper with the new path elements
   *
   * @memberOf ValueWrapper
   */
  pushPath (path) {
    if (path === undefined) {
      return this
    }
    path = ValueWrapper.pathAsArray(path)
    return new ValueWrapper(this.value, this.path.concat(path))
  }
}
